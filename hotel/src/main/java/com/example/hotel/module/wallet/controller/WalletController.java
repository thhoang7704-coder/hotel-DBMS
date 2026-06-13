package com.example.hotel.module.wallet.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.hotel.common.response.ApiResponse;
import com.example.hotel.module.wallet.dto.DepositRequest;
import com.example.hotel.module.wallet.dto.WalletResponse;
import com.example.hotel.module.wallet.service.interfaces.IWalletService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final IWalletService walletService;

    @GetMapping("/me")
    public ApiResponse<WalletResponse> getMyWallet() {

        return ApiResponse.ok(
                walletService.getMyWallet());
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/deposit")
    public ApiResponse<WalletResponse> deposit(
            @Valid @RequestBody DepositRequest request) {

        return ApiResponse.ok(
                walletService.deposit(request));
    }

}
