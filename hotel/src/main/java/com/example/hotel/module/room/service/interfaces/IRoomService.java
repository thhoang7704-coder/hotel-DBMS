package com.example.hotel.module.room.service.interfaces;

import java.util.UUID;

import com.example.hotel.common.response.PageRequestDTO;
import com.example.hotel.common.response.PaginationResponse;
import com.example.hotel.module.room.dto.CreateRoomRequest;
import com.example.hotel.module.room.dto.RoomResponse;
import com.example.hotel.module.room.dto.UpdateRoomPriceRequest;
import com.example.hotel.module.room.dto.UpdateRoomRequest;
import com.example.hotel.module.room.entity.Room;

public interface IRoomService {

    Room createRoom(CreateRoomRequest request);

    Room updateRoom(UUID roomId, UpdateRoomRequest request);

    Room updateRoomPrice(UUID roomId, UpdateRoomPriceRequest request);

    PaginationResponse<RoomResponse> getAllRooms(PageRequestDTO pageRequestDTO);

}
