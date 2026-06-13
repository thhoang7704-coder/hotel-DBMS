package com.example.hotel.module.invoice.controller;

import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.hotel.common.response.ApiResponse;
import com.example.hotel.module.invoice.dto.InvoiceResponse;
import com.example.hotel.module.invoice.service.interfaces.IInvoiceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/invoices")
@RequiredArgsConstructor
public class InvoiceController {
    private final IInvoiceService invoiceService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{bookingId}")
    public ApiResponse<InvoiceResponse> createInvoice(
            @PathVariable UUID bookingId) {

        return ApiResponse.ok(
                invoiceService.createInvoice(bookingId));

    }
}
