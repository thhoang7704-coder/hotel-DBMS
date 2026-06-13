package com.example.hotel.module.invoice.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hotel.module.invoice.enitity.Invoice;

public interface InvoiceRepository
        extends JpaRepository<Invoice, UUID> {

    Optional<Invoice> findByBookingId(UUID bookingId);

    Page<Invoice> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

}
