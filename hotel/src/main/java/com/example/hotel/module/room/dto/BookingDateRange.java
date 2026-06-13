package com.example.hotel.module.room.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDateRange {
    private LocalDate checkIn;
    private LocalDate checkOut;
}
