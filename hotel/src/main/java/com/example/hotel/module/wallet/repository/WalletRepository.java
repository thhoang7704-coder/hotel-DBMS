package com.example.hotel.module.wallet.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import com.example.hotel.module.wallet.entity.Wallet;

import jakarta.persistence.LockModeType;

public interface WalletRepository extends JpaRepository<Wallet, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select w
            from Wallet w
            where w.user.id = :userId
            """)
    Optional<Wallet> findByUserIdForUpdate(UUID userId);

    Optional<Wallet> findByUserId(UUID userId);
}
