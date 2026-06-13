package com.example.hotel.module.wallet.service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.hotel.common.exception.ResourceNotFoundException;
import com.example.hotel.common.exception.UnauthorizedException;
import com.example.hotel.common.security.SecurityUtils;
import com.example.hotel.common.security.UserDetailsImpl;
import com.example.hotel.enums.WalletTransactionType;
import com.example.hotel.module.wallet.dto.DepositRequest;
import com.example.hotel.module.wallet.dto.WalletResponse;
import com.example.hotel.module.wallet.entity.Wallet;
import com.example.hotel.module.wallet.entity.WalletTransaction;
import com.example.hotel.module.wallet.repository.WalletRepository;
import com.example.hotel.module.wallet.repository.WalletTransactionRepository;
import com.example.hotel.module.wallet.service.interfaces.IWalletService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WalletService implements IWalletService {
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    @Override
    @Transactional(readOnly = true)
    public WalletResponse getMyWallet() {

        UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

        if (currentUser == null) {
            throw new UnauthorizedException(
                    "401",
                    "Unauthorized");
        }

        Wallet wallet = walletRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "404",
                        "Wallet not found"));

        return WalletResponse.fromEntity(wallet);
    }

    @Override
    @Transactional
    public WalletResponse deposit(DepositRequest request) {

        UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

        if (currentUser == null) {
            throw new UnauthorizedException(
                    "401",
                    "Unauthorized");
        }

        Wallet wallet = walletRepository
                .findByUserIdForUpdate(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "404",
                        "Wallet not found"));

        BigDecimal balanceBefore = wallet.getBalance();

        BigDecimal balanceAfter = balanceBefore.add(request.getAmount());

        wallet.setBalance(balanceAfter);

        walletTransactionRepository.save(

                WalletTransaction.builder()
                        .wallet(wallet)
                        .amount(request.getAmount())
                        .balanceBefore(balanceBefore)
                        .balanceAfter(balanceAfter)
                        .transactionType(WalletTransactionType.DEPOSIT)
                        .description("Deposit money")
                        .createdAt(OffsetDateTime.now())
                        .build()

        );

        return WalletResponse.fromEntity(wallet);
    }
}
