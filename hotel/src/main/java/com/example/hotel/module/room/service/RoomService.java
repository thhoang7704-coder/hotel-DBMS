package com.example.hotel.module.room.service;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.hotel.common.exception.ConflictException;
import com.example.hotel.common.exception.ResourceNotFoundException;
import com.example.hotel.common.response.PageRequestDTO;
import com.example.hotel.common.response.PaginationResponse;
import com.example.hotel.common.security.SecurityUtils;
import com.example.hotel.common.security.UserDetailsImpl;
import com.example.hotel.module.booking.entity.Booking;
import com.example.hotel.module.room.dto.BookingDateRange;
import com.example.hotel.module.room.dto.CreateRoomRequest;
import com.example.hotel.module.room.dto.RoomResponse;
import com.example.hotel.module.room.dto.UpdateRoomPriceRequest;
import com.example.hotel.module.room.dto.UpdateRoomRequest;
import com.example.hotel.module.room.entity.Room;
import com.example.hotel.module.room.repository.RoomRepository;
import com.example.hotel.module.room.service.interfaces.IRoomService;
import com.example.hotel.common.service.CloudinaryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoomService implements IRoomService {

    private final RoomRepository roomRepository;
    private final CloudinaryService cloudinaryService;
    private final com.example.hotel.module.booking.repository.BookingRepository bookingRepository;

    @Override
    @Transactional
    public Room createRoom(CreateRoomRequest request) {

        UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

        if (currentUser == null) {
            throw new ResourceNotFoundException("404", "User not found");
        }

        if (roomRepository.findByRoomNumber(request.getRoomNumber()).isPresent()) {
            throw new ConflictException("409", "User not found");
        }

        Room room = Room.builder()
                .roomNumber(request.getRoomNumber())
                .roomType(request.getRoomType())
                .pricePerNight(request.getPricePerNight())
                .floorNumber(request.getFloorNumber())
                .status(request.getStatus())
                .build();

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            try {
                String imageUrl = cloudinaryService.uploadImage(request.getImage());
                room.setImageUrl(imageUrl);
            } catch (java.io.IOException e) {
                throw new RuntimeException("Failed to upload image", e);
            }
        }

        roomRepository.save(room);

        return room;

    }

    @Override
    @Transactional
    public Room updateRoom(
            UUID roomId,
            UpdateRoomRequest request) {

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "404",
                        "Room not found"));

        room.setRoomNumber(request.getRoomNumber());
        room.setRoomType(request.getRoomType());
        room.setFloorNumber(request.getFloorNumber());
        room.setStatus(request.getStatus());

        return roomRepository.save(room);
    }

    @Override
    @Transactional
    public Room updateRoomPrice(
            UUID roomId,
            UpdateRoomPriceRequest request) {

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "404",
                        "Room not found"));

        room.setPricePerNight(request.getPricePerNight());

        return roomRepository.save(room);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<RoomResponse> getAllRooms(PageRequestDTO pageRequestDTO) {

        Page<Room> page = roomRepository.findAll(pageRequestDTO.toPageable());

        List<UUID> roomIds = page.getContent().stream()
                .map(Room::getId)
                .toList();

        List<Booking> bookings = roomIds.isEmpty()
                ? Collections.emptyList()
                : bookingRepository.findFutureBookingsByRoomIds(roomIds, LocalDate.now());

        Map<UUID, List<BookingDateRange>> bookedDatesMap = bookings.stream()
                .collect(Collectors.groupingBy(
                        b -> b.getRoom().getId(),
                        Collectors.mapping(
                                b -> new BookingDateRange(b.getCheckIn(), b.getCheckOut()),
                                Collectors.toList())));
        Page<RoomResponse> responsePage = page.map(room -> {
            RoomResponse res = RoomResponse.fromEntity(room);
            res.setBookedDates(bookedDatesMap.getOrDefault(room.getId(), Collections.emptyList()));
            return res;
        });

        return PaginationResponse.fromPage(responsePage);

    }
}
