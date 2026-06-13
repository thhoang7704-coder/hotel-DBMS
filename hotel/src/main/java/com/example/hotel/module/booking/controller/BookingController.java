package com.example.hotel.module.booking.controller;

import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.hotel.common.response.ApiResponse;
import com.example.hotel.common.response.PageRequestDTO;
import com.example.hotel.common.response.PaginationResponse;
import com.example.hotel.module.booking.dto.CreateBookingRequest;
import com.example.hotel.module.booking.service.interfaces.IBookingService;
import com.example.hotel.module.invoice.dto.BookingWithInvoiceResponse;
import com.example.hotel.module.payment.service.interfaces.IPaymentService;
import com.example.hotel.module.wallet.dto.PaymentResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {
        private final IBookingService bookingService;
        private final IPaymentService paymentService;

        @PostMapping
        @PreAuthorize("hasRole('USER')")
        public ApiResponse<BookingWithInvoiceResponse> createBooking(
                        @Valid @RequestBody CreateBookingRequest request) {

                return ApiResponse.ok(
                                bookingService.createBooking(request));

        }

        @PreAuthorize("hasRole('USER')")
        @PostMapping("/{bookingId}/payment")
        public ApiResponse<PaymentResponse> pay(
                        @PathVariable UUID bookingId) {

                return ApiResponse.ok(
                                paymentService.pay(bookingId));
        }

        @GetMapping("/me")
        @PreAuthorize("hasRole('USER')")
        public ApiResponse<PaginationResponse<BookingWithInvoiceResponse>> getMyBookings(
                        @ModelAttribute PageRequestDTO pageRequestDTO) {

                return ApiResponse.ok(
                                bookingService.getMyBookings(pageRequestDTO));
        }

}
