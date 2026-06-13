package com.example.hotel.User.controller;

import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.hotel.User.dto.ChangePasswordRequest;
import com.example.hotel.User.dto.ToggleUserStatusResponse;
import com.example.hotel.User.dto.UpdateProfileRequest;
import com.example.hotel.User.dto.UpdateProfileResponse;
import com.example.hotel.User.dto.UserListItemDto;
import com.example.hotel.User.dto.UserProfileResponse;
import com.example.hotel.User.dto.UserResponse;
import com.example.hotel.User.service.UserService;
import com.example.hotel.common.response.ApiResponse;
import com.example.hotel.common.response.PageRequestDTO;
import com.example.hotel.common.response.PaginationResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getMyProfile() {
        UserProfileResponse response = userService.getMyProfile();
        return ApiResponse.ok(response, "Get profile successfully");
    }

    @PutMapping("/me")
    public ApiResponse<UpdateProfileResponse> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest request) {

        UpdateProfileResponse response = userService.updateMyProfile(request);

        return ApiResponse.ok(response, "Cập nhật thành công");
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> getUserById(
            @PathVariable UUID id) {

        return ApiResponse.ok(
                userService.getUserById(id));
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ToggleUserStatusResponse> toggleUserStatus(
            @PathVariable UUID id) {

        return ApiResponse.ok(
                userService.toggleUserStatus(id));
    }

    @PutMapping("/change-password")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ApiResponse<String> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {

        userService.changePassword(request);

        return ApiResponse.ok(
                "Password changed successfully");
    }

    @GetMapping
    public ApiResponse<PaginationResponse<UserListItemDto>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        return ApiResponse.ok(
                userService.getAllUsers(
                        PageRequestDTO.of(
                                page,
                                size,
                                sortBy,
                                sortDirection)));
    }
}
