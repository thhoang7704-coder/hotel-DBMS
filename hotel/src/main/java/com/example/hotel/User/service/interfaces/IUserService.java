package com.example.hotel.User.service.interfaces;

import java.util.UUID;

import com.example.hotel.User.dto.ChangePasswordRequest;
import com.example.hotel.User.dto.ToggleUserStatusResponse;
import com.example.hotel.User.dto.UpdateProfileRequest;
import com.example.hotel.User.dto.UpdateProfileResponse;
import com.example.hotel.User.dto.UserListItemDto;
import com.example.hotel.User.dto.UserProfileResponse;
import com.example.hotel.User.dto.UserResponse;
import com.example.hotel.common.response.PageRequestDTO;
import com.example.hotel.common.response.PaginationResponse;

public interface IUserService {
    UserProfileResponse getMyProfile();

    UpdateProfileResponse updateMyProfile(UpdateProfileRequest request);

    void changePassword(ChangePasswordRequest request);

    PaginationResponse<UserListItemDto> getAllUsers(
            PageRequestDTO pageRequestDTO);

    UserResponse getUserById(UUID id);

    ToggleUserStatusResponse toggleUserStatus(UUID userId);
}
