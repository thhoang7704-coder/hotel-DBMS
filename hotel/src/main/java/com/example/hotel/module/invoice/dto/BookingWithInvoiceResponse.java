package com.example.hotel.module.invoice.dto;

import com.example.hotel.module.booking.dto.BookingResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingWithInvoiceResponse {

    private BookingResponse booking;

    private InvoiceResponse invoice;

}
