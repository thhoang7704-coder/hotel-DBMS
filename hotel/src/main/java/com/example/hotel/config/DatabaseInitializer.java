package com.example.hotel.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.hotel.User.User;
import com.example.hotel.User.repository.UserRepository;
import com.example.hotel.enums.UserRole;
import com.example.hotel.module.wallet.entity.Wallet;
import com.example.hotel.module.wallet.repository.WalletRepository;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info(">>> START INIT DATABASE");

        if (userRepository.findByEmail("superadmin@gmail.com").isEmpty()) {
            log.info(">>> Admin account not found. Initializing default ADMIN account...");

            User adminUser = User.builder()
                    .email("superadmin@gmail.com")
                    .passwordHash(passwordEncoder.encode("Admin@12345"))
                    .fullName("Super Admin")
                    .phone("0123456789")
                    .role(UserRole.ADMIN)
                    .isActive(true)
                    .build();

            userRepository.save(adminUser);
            Wallet wallet = Wallet.builder()
                    .user(adminUser)
                    .balance(BigDecimal.ZERO)
                    .build();

            walletRepository.save(wallet);
        } else {
            log.info(">>> Database already initialized (Admin exists)");
        }

        log.info(">>> END INIT DATABASE");
    }
}