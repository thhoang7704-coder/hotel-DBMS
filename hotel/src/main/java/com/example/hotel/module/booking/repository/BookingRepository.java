package com.example.hotel.module.booking.repository;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.hotel.module.booking.entity.Booking;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    @Query("""
            SELECT COUNT(b) > 0
            FROM Booking b
            WHERE b.room.id = :roomId
            AND b.status <> 'CANCELLED'
            AND (
                    b.checkIn < :checkOut
                    AND b.checkOut > :checkIn
                )
            """)
    boolean existsOverlappingBooking(
            UUID roomId,
            LocalDate checkIn,
            LocalDate checkOut);

    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId ORDER BY b.createdAt DESC")
    Page<Booking> findByUserId(UUID userId, Pageable pageable);

    @Query("""
            SELECT b FROM Booking b
            WHERE b.room.id IN :roomIds
            AND b.status <> 'CANCELLED'
            AND b.checkOut > :today
            """)
    java.util.List<Booking> findFutureBookingsByRoomIds(
            @org.springframework.data.repository.query.Param("roomIds") java.util.List<UUID> roomIds,
            @org.springframework.data.repository.query.Param("today") LocalDate today);

}
