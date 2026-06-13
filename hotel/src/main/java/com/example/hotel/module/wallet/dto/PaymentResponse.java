package com.example.hotel.module.wallet.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.hotel.enums.PaymentStatus;
import com.example.hotel.module.payment.entity.PaymentTransaction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private UUID paymentId;

    private UUID bookingId;

    private BigDecimal amount;

    private PaymentStatus status;

    private BigDecimal payerBalanceAfter;

    private BigDecimal receiverBalanceAfter;

    private OffsetDateTime createdAt;

    // Booking Details
    private String roomNumber;
    private String roomType;
    private java.time.LocalDate checkIn;
    private java.time.LocalDate checkOut;

    public static PaymentResponse fromEntity(
            PaymentTransaction payment) {

        return PaymentResponse.builder()
                .paymentId(payment.getId())
                .bookingId(payment.getBooking().getId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .payerBalanceAfter(
                        payment.getPayerWallet().getBalance())
                .receiverBalanceAfter(
                        payment.getReceiverWallet().getBalance())
                .createdAt(payment.getCreatedAt())
                .roomNumber(payment.getBooking().getRoom().getRoomNumber())
                .roomType(payment.getBooking().getRoom().getRoomType().name())
                .checkIn(payment.getBooking().getCheckIn())
                .checkOut(payment.getBooking().getCheckOut())
                .build();

    }
}
