package com.example.hotel.module.invoice.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import com.example.hotel.enums.InvoiceStatus;
import com.example.hotel.module.booking.entity.Booking;
import com.example.hotel.module.invoice.enitity.Invoice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {

    private UUID id;

    private Integer totalDays;

    private BigDecimal pricePerNight;

    private BigDecimal totalAmount;

    private InvoiceStatus status;

    private OffsetDateTime createdAt;

    public static InvoiceResponse fromEntity(Invoice invoice) {

        Booking booking = invoice.getBooking();

        long totalDays = ChronoUnit.DAYS.between(
                booking.getCheckIn(),
                booking.getCheckOut());

        return InvoiceResponse.builder()
                .id(invoice.getId())
                .totalDays((int) totalDays)
                .pricePerNight(booking.getRoom().getPricePerNight())
                .totalAmount(invoice.getTotalAmount())
                .status(invoice.getStatus())
                .createdAt(invoice.getCreatedAt())
                .build();
    }

}
