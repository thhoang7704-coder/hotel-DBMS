package com.example.hotel.module.invoice.service.interfaces;

import java.util.UUID;

import com.example.hotel.module.invoice.dto.InvoiceResponse;

public interface IInvoiceService {
    public InvoiceResponse createInvoice(UUID bookingId);
}
