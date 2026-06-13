package com.example.hotel.module.wallet.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.hotel.module.wallet.entity.Wallet;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletResponse {

    private UUID walletId;

    private BigDecimal balance;

    private OffsetDateTime createdAt;

    public static WalletResponse fromEntity(Wallet wallet) {

        return WalletResponse.builder()
                .walletId(wallet.getId())
                .balance(wallet.getBalance())
                .createdAt(wallet.getCreatedAt())
                .build();

    }
}
