package com.example.hotel.module.booking.dto;

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
public class BookingUserResponse {

    private UUID id;

    private String fullName;

    private String phone;

    private String email;

    public static BookingUserResponse fromEntity(User user) {

        return BookingUserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .build();

    }
}