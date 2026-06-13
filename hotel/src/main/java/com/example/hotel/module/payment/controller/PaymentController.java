package com.example.hotel.module.payment.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.hotel.common.response.ApiResponse;
import com.example.hotel.common.response.PageRequestDTO;
import com.example.hotel.common.response.PaginationResponse;
import com.example.hotel.module.payment.dto.PaymentAdminResponse;
import com.example.hotel.module.payment.service.interfaces.IPaymentService;
import com.example.hotel.module.wallet.dto.PaymentResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final IPaymentService paymentService;

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/me")
    public ApiResponse<List<PaymentResponse>> getMyPayments() {

        return ApiResponse.ok(
                paymentService.getMyPayments());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ApiResponse<PaginationResponse<PaymentAdminResponse>> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        return ApiResponse.ok(
                paymentService.getAllPayments(
                        PageRequestDTO.of(
                                page,
                                size,
                                sortBy,
                                sortDirection)));
    }
}
