package com.example.hotel.module.room.controller;

import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.MediaType;

import com.example.hotel.common.response.ApiResponse;
import com.example.hotel.common.response.PageRequestDTO;
import com.example.hotel.common.response.PaginationResponse;
import com.example.hotel.module.room.dto.CreateRoomRequest;
import com.example.hotel.module.room.dto.RoomResponse;
import com.example.hotel.module.room.dto.UpdateRoomPriceRequest;
import com.example.hotel.module.room.dto.UpdateRoomRequest;
import com.example.hotel.module.room.service.interfaces.IRoomService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final IRoomService roomService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<RoomResponse> createRoom(
            @Valid @ModelAttribute CreateRoomRequest request) {

        return ApiResponse.ok(RoomResponse.fromEntity(roomService.createRoom(request)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{roomId}")
    public ApiResponse<RoomResponse> updateRoom(
            @PathVariable UUID roomId,
            @Valid @RequestBody UpdateRoomRequest request) {

        return ApiResponse.ok(
                RoomResponse.fromEntity(
                        roomService.updateRoom(roomId, request)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{roomId}/price")
    public ApiResponse<RoomResponse> updateRoomPrice(
            @PathVariable UUID roomId,
            @Valid @RequestBody UpdateRoomPriceRequest request) {

        return ApiResponse.ok(
                RoomResponse.fromEntity(
                        roomService.updateRoomPrice(roomId, request)));
    }

    @GetMapping
    public ApiResponse<PaginationResponse<RoomResponse>> getAllRooms(
            @ModelAttribute PageRequestDTO pageRequestDTO) {

        return ApiResponse.ok(
                roomService.getAllRooms(pageRequestDTO));

    }
}
