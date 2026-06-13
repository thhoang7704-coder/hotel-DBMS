package com.example.hotel.User.service;

import java.util.UUID;

import org.springframework.data.domain.Page;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.hotel.User.User;
import com.example.hotel.User.dto.ChangePasswordRequest;
import com.example.hotel.User.dto.ToggleUserStatusResponse;
import com.example.hotel.User.dto.UpdateProfileRequest;
import com.example.hotel.User.dto.UpdateProfileResponse;
import com.example.hotel.User.dto.UserListItemDto;
import com.example.hotel.User.dto.UserMapper;
import com.example.hotel.User.dto.UserProfileResponse;
import com.example.hotel.User.dto.UserResponse;
import com.example.hotel.User.repository.UserRepository;
import com.example.hotel.User.service.interfaces.IUserService;
import com.example.hotel.common.exception.BadRequestException;
import com.example.hotel.common.exception.ResourceNotFoundException;
import com.example.hotel.common.response.PaginationResponse;
import com.example.hotel.common.response.PageRequestDTO;
import com.example.hotel.common.security.SecurityUtils;
import com.example.hotel.common.security.UserDetailsImpl;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor

public class UserService implements IUserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserProfileResponse getMyProfile() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        UserDetailsImpl currentUser = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("404", "User not found"));

        return userMapper.toProfileResponse(user);
    }

    @Override
    public UpdateProfileResponse updateMyProfile(
            UpdateProfileRequest request) {

        UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("404", "User not found"));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        userRepository.save(user);

        return userMapper.toUpdateProfileResponse(user);
    }

    @Override
    public void changePassword(ChangePasswordRequest request) {

        UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("404", "User not found"));

        boolean isMatch = passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPasswordHash());

        if (!isMatch) {
            throw new BadRequestException(
                    "400", "Mật khẩu hiện tại không chính xác");
        }

        String encodedPassword = passwordEncoder.encode(
                request.getNewPassword());

        user.setPasswordHash(encodedPassword);

        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<UserListItemDto> getAllUsers(
            PageRequestDTO pageRequestDTO) {

        Page<UserListItemDto> page = userRepository
                .findAll(pageRequestDTO.toPageable())
                .map(this::mapToDto);

        return PaginationResponse.fromPage(page);
    }

    private UserListItemDto mapToDto(User user) {

        return UserListItemDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Override
    public UserResponse getUserById(UUID id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    @Override
    public ToggleUserStatusResponse toggleUserStatus(UUID userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Không cho khóa ADMIN
        if (user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Cannot block admin account");
        }

        // đảo trạng thái
        user.setActive(!user.isActive());

        User savedUser = userRepository.save(user);

        return ToggleUserStatusResponse.builder()
                .id(savedUser.getId())
                .fullName(savedUser.getFullName())
                .isActive(savedUser.isActive())
                .build();
    }
}
