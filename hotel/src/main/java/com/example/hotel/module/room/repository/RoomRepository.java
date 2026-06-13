package com.example.hotel.module.room.repository;

import com.example.hotel.module.room.entity.Room;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface RoomRepository extends JpaRepository<Room, UUID> {

    Optional<Room> findByRoomNumber(String roomNumber);

    @Lock(LockModeType.PESSIMISTIC_WRITE) // khóa bản ghi để tránh lost update khi nhiều transaction cùng cập nhật một
                                          // bản ghi
    @Query("""
            select r
            from Room r
            where r.id = :id
            """)
    Optional<Room> findByIdForUpdate(UUID id);

}