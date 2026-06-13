package com.example.hotel.module.booking.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.hotel.enums.BookingStatus;
import com.example.hotel.module.booking.entity.Booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private UUID id;

    private UUID roomId;

    private String roomNumber;

    private BookingUserResponse user;

    private LocalDate checkIn;

    private LocalDate checkOut;

    private BigDecimal totalPrice;

    private BookingStatus status;

    private OffsetDateTime createdAt;

    public static BookingResponse fromEntity(Booking booking) {

        return BookingResponse.builder()
                .id(booking.getId())
                .roomId(booking.getRoom().getId())
                .roomNumber(booking.getRoom().getRoomNumber())
                .user(BookingUserResponse.fromEntity(booking.getUser()))
                .checkIn(booking.getCheckIn())
                .checkOut(booking.getCheckOut())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .build();

    }

}