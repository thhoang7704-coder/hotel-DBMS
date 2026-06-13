package com.example.hotel.module.room.dto;

import com.example.hotel.enums.RoomStatus;
import com.example.hotel.enums.RoomType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class UpdateRoomRequest {

    @NotBlank
    private String roomNumber;

    @NotNull
    private RoomType roomType;

    @Positive // không được nhỏ hơn hoặc bằng 0
    private Integer floorNumber;

    @NotNull
    private RoomStatus status;

}
