package com.example.hotel.module.room.dto;

import com.example.hotel.enums.RoomStatus;
import com.example.hotel.enums.RoomType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import org.springframework.web.multipart.MultipartFile;

@Data
public class CreateRoomRequest {

    @NotBlank
    private String roomNumber;

    @NotNull
    private RoomType roomType;

    @NotNull
    private BigDecimal pricePerNight;

    @NotNull
    private Integer floorNumber;

    @NotNull
    private RoomStatus status;

    private MultipartFile image;

}