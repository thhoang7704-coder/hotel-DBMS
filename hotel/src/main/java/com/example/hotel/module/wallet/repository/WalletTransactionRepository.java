package com.example.hotel.module.wallet.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hotel.module.wallet.entity.WalletTransaction;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, UUID> {

}
