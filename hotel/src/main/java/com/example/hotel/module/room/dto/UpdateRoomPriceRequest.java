package com.example.hotel.module.room.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class UpdateRoomPriceRequest {

    @NotNull
    @Positive
    private BigDecimal pricePerNight;

}
