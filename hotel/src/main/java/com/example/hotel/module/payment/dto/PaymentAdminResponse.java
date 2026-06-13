package com.example.hotel.module.payment.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.hotel.enums.PaymentStatus;
import com.example.hotel.module.payment.entity.PaymentTransaction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentAdminResponse {

    private UUID paymentId;

    private UUID bookingId;

    private PaymentUserResponse user;

    private BigDecimal amount;

    private PaymentStatus status;

    private OffsetDateTime createdAt;

    public static PaymentAdminResponse fromEntity(
            PaymentTransaction payment) {

        return PaymentAdminResponse.builder()
                .paymentId(payment.getId())
                .bookingId(payment.getBooking().getId())
                .user(
                        PaymentUserResponse.fromEntity(
                                payment.getPayerWallet().getUser()))
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .createdAt(payment.getCreatedAt())
                .build();

    }

}