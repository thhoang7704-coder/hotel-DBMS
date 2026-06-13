package com.example.hotel.module.payment.service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.hotel.User.User;
import com.example.hotel.User.repository.UserRepository;
import com.example.hotel.common.exception.BadRequestException;
import com.example.hotel.common.exception.ResourceNotFoundException;
import com.example.hotel.common.exception.UnauthorizedException;
import com.example.hotel.common.response.PageRequestDTO;
import com.example.hotel.common.response.PaginationResponse;
import com.example.hotel.common.security.SecurityUtils;
import com.example.hotel.common.security.UserDetailsImpl;
import com.example.hotel.enums.BookingStatus;
import com.example.hotel.enums.InvoiceStatus;
import com.example.hotel.enums.PaymentStatus;
import com.example.hotel.enums.UserRole;
import com.example.hotel.enums.WalletTransactionType;
import com.example.hotel.module.booking.entity.Booking;
import com.example.hotel.module.booking.repository.BookingRepository;
import com.example.hotel.module.invoice.enitity.Invoice;
import com.example.hotel.module.invoice.repository.InvoiceRepository;
import com.example.hotel.module.payment.dto.PaymentAdminResponse;
import com.example.hotel.module.payment.entity.PaymentTransaction;
import com.example.hotel.module.payment.repository.PaymentTransactionRepository;
import com.example.hotel.module.payment.service.interfaces.IPaymentService;
import com.example.hotel.module.wallet.dto.PaymentResponse;
import com.example.hotel.module.wallet.entity.Wallet;
import com.example.hotel.module.wallet.entity.WalletTransaction;
import com.example.hotel.module.wallet.repository.WalletRepository;
import com.example.hotel.module.wallet.repository.WalletTransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService implements IPaymentService {
    private final BookingRepository bookingRepository;
    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;

    @Transactional
    @Override
    public PaymentResponse pay(UUID bookingId) {

        UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "404",
                        "User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "404",
                        "Booking not found"));

        Invoice invoice = invoiceRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "404",
                        "Invoice not found"));

        User admin = userRepository.findFirstByRole(UserRole.ADMIN)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "404",
                        "Admin not found"));

        Wallet payerWallet = walletRepository.findByUserIdForUpdate(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "404",
                        "Wallet not found"));

        Wallet receiverWallet = walletRepository.findByUserIdForUpdate(admin.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "404",
                        "Admin wallet not found"));
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException(
                    "403",
                    "You are not allowed to pay this booking");

        }
        if (booking.getStatus() == BookingStatus.PAID) {
            throw new BadRequestException(
                    "400",
                    "Booking has already been paid");
        }
        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BadRequestException(
                    "400",
                    "Invoice has already been paid");
        }
        BigDecimal amount = invoice.getTotalAmount();

        if (payerWallet.getBalance().compareTo(amount) < 0) {
            throw new BadRequestException(
                    "400",
                    "Insufficient balance");
        }

        BigDecimal payerBefore = payerWallet.getBalance();
        BigDecimal receiverBefore = receiverWallet.getBalance();

        payerWallet.setBalance(
                payerBefore.subtract(amount));

        receiverWallet.setBalance(
                receiverBefore.add(amount));
        walletTransactionRepository.save(
                WalletTransaction.builder()
                        .wallet(payerWallet)
                        .amount(amount)
                        .balanceBefore(payerBefore)
                        .balanceAfter(payerWallet.getBalance())
                        .transactionType(WalletTransactionType.PAYMENT)
                        .description("Pay booking " + booking.getId())
                        .createdAt(OffsetDateTime.now())
                        .build());

        walletTransactionRepository.save(
                WalletTransaction.builder()
                        .wallet(receiverWallet)
                        .amount(amount)
                        .balanceBefore(receiverBefore)
                        .balanceAfter(receiverWallet.getBalance())
                        .transactionType(WalletTransactionType.RECEIVE)
                        .description("Receive payment booking " + booking.getId())
                        .createdAt(OffsetDateTime.now())
                        .build());

        PaymentTransaction payment = paymentTransactionRepository.save(

                PaymentTransaction.builder()
                        .booking(booking)
                        .payerWallet(payerWallet)
                        .receiverWallet(receiverWallet)
                        .amount(amount)
                        .status(PaymentStatus.SUCCESS)
                        .createdAt(OffsetDateTime.now())
                        .build());

        // cập nhật trạng thái
        booking.setStatus(BookingStatus.PAID);

        invoice.setStatus(InvoiceStatus.PAID);

        return PaymentResponse.builder()
                .paymentId(payment.getId())
                .bookingId(booking.getId())
                .amount(amount)
                .status(payment.getStatus())
                .payerBalanceAfter(payerWallet.getBalance())
                .receiverBalanceAfter(receiverWallet.getBalance())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getMyPayments() {

        UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

        if (currentUser == null) {
            throw new UnauthorizedException(
                    "401",
                    "Unauthorized");
        }

        List<PaymentTransaction> payments = paymentTransactionRepository
                .findByPayerWallet_User_Id(currentUser.getId());

        return payments.stream()
                .map(PaymentResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<PaymentAdminResponse> getAllPayments(
            PageRequestDTO pageRequestDTO) {

        UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

        if (currentUser == null) {
            throw new UnauthorizedException(
                    "401",
                    "Unauthorized");
        }

        Page<PaymentAdminResponse> page = paymentTransactionRepository
                .findAll(pageRequestDTO.toPageable())
                .map(PaymentAdminResponse::fromEntity);

        return PaginationResponse.fromPage(page);
    }
}
