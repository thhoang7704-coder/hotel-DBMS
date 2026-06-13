package com.example.hotel.module.room.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

import com.example.hotel.enums.RoomStatus;
import com.example.hotel.enums.RoomType;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String roomNumber;

    @Enumerated(EnumType.STRING)
    private RoomType roomType;

    @Column(nullable = false)
    private BigDecimal pricePerNight;

    private Integer floorNumber;

    @Enumerated(EnumType.STRING)
    private RoomStatus status;

    private String imageUrl;

    @Version
    // là cơ chế Optimistic Locking để tránh bị lost update khi nhiều transaction
    // cùng cập nhật một bản ghi
    private Long version;
}
