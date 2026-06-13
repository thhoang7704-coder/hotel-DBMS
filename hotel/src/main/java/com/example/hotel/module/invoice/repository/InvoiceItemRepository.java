package com.example.hotel.module.invoice.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hotel.module.invoice.enitity.InvoiceItem;

public interface InvoiceItemRepository
        extends JpaRepository<InvoiceItem, UUID> {

    List<InvoiceItem> findByInvoiceId(UUID invoiceId);

}