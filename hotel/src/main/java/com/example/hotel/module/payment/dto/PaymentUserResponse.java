package com.example.hotel.module.payment.dto;

import java.util.UUID;

import com.example.hotel.User.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentUserResponse {

    private UUID id;

    private String fullName;

    private String email;

    private String phone;

    public static PaymentUserResponse fromEntity(User user) {
        return PaymentUserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .build();
    }
}