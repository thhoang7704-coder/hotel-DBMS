package com.example.hotel.module.wallet.service.interfaces;

import com.example.hotel.module.wallet.dto.DepositRequest;
import com.example.hotel.module.wallet.dto.WalletResponse;

public interface IWalletService {
    WalletResponse getMyWallet();

    WalletResponse deposit(DepositRequest request);
}
