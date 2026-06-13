package com.example.hotel.module.booking.service.interfaces;

import com.example.hotel.module.booking.dto.CreateBookingRequest;
import com.example.hotel.module.invoice.dto.BookingWithInvoiceResponse;
import com.example.hotel.common.response.PageRequestDTO;
import com.example.hotel.common.response.PaginationResponse;

public interface IBookingService {
    BookingWithInvoiceResponse createBooking(
            CreateBookingRequest request);

    PaginationResponse<BookingWithInvoiceResponse> getMyBookings(PageRequestDTO pageRequestDTO);
}
