package com.example.hotel.enums;

public enum WalletTransactionType {

    DEPOSIT, // Nạp tiền

    WITHDRAW, // Rút tiền

    PAYMENT, // Thanh toán đặt phòng (tiền đi ra)

    RECEIVE, // Nhận tiền (admin nhận tiền thanh toán)

    REFUND, // Hoàn tiền (user nhận lại)

    TRANSFER_OUT, // Chuyển tiền sang ví khác

    TRANSFER_IN // Nhận tiền từ ví khác

}