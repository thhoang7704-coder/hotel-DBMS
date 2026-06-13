package com.example.hotel.module.room.dto;

import com.example.hotel.enums.RoomStatus;
import com.example.hotel.enums.RoomType;
import com.example.hotel.module.room.entity.Room;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {

    private UUID id;

    private String roomNumber;

    private RoomType roomType;

    private BigDecimal pricePerNight;

    private Integer floorNumber;

    private RoomStatus status;

    private String imageUrl;

    private List<BookingDateRange> bookedDates;

    public static RoomResponse fromEntity(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .roomType(room.getRoomType())
                .pricePerNight(room.getPricePerNight())
                .floorNumber(room.getFloorNumber())
                .status(room.getStatus())
                .imageUrl(room.getImageUrl())
                .build();
    }

}