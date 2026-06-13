package com.example.hotel.module.invoice.service;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.hotel.common.exception.BadRequestException;
import com.example.hotel.common.exception.ResourceNotFoundException;
import com.example.hotel.enums.InvoiceItemType;
import com.example.hotel.enums.InvoiceStatus;
import com.example.hotel.module.booking.entity.Booking;
import com.example.hotel.module.booking.repository.BookingRepository;
import com.example.hotel.module.invoice.dto.InvoiceResponse;
import com.example.hotel.module.invoice.enitity.Invoice;
import com.example.hotel.module.invoice.enitity.InvoiceItem;
import com.example.hotel.module.invoice.repository.InvoiceItemRepository;
import com.example.hotel.module.invoice.repository.InvoiceRepository;
import com.example.hotel.module.invoice.service.interfaces.IInvoiceService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InvoiceService implements IInvoiceService {
    private final BookingRepository bookingRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;

    @Override
    @Transactional
    public InvoiceResponse createInvoice(UUID bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "404",
                        "Booking not found"));

        if (invoiceRepository.findByBookingId(bookingId).isPresent()) {
            throw new BadRequestException(
                    "400",
                    "Invoice already exists");
        }

        long totalDays = ChronoUnit.DAYS.between(
                booking.getCheckIn(),
                booking.getCheckOut());

        if (totalDays <= 0) {
            throw new BadRequestException(
                    "400",
                    "Invalid check in and check out date");
        }

        BigDecimal totalAmount = booking.getRoom()
                .getPricePerNight()
                .multiply(BigDecimal.valueOf(totalDays));

        Invoice invoice = Invoice.builder()
                .booking(booking)
                .user(booking.getUser())
                .totalAmount(totalAmount)
                .status(InvoiceStatus.PENDING)
                .build();

        invoiceRepository.save(invoice);

        InvoiceItem item = InvoiceItem.builder()
                .invoice(invoice)
                .itemType(InvoiceItemType.ROOM)
                .itemName(booking.getRoom().getRoomType().name())
                .quantity((int) totalDays)
                .unitPrice(booking.getRoom().getPricePerNight())
                .subtotal(totalAmount)
                .build();

        invoiceItemRepository.save(item);

        return InvoiceResponse.fromEntity(invoice);

    }
}
