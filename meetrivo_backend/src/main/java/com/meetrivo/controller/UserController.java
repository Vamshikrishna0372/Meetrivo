package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.dto.UserResponse;
import com.meetrivo.service.UserService;
import com.meetrivo.storage.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Endpoints for managing user profiles")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @Operation(summary = "Get User Profile", description = "Returns the profile of the currently logged in user")
    public ApiResponse<UserResponse> getProfile() {
        return ApiResponse.success(userService.getProfile(), "User profile retrieved");
    }

    @GetMapping("/stats")
    @Operation(summary = "Get User Stats", description = "Returns meeting stats for the current user: total meetings, total hours, workspaces")
    public ApiResponse<Map<String, Object>> getUserStats() {
        return ApiResponse.success(userService.getUserStats(), "User stats retrieved successfully");
    }

    @PutMapping("/profile")
    @Operation(summary = "Update User Profile", description = "Updates full name and bio of the current user")
    public ApiResponse<UserResponse> updateProfile(@RequestBody Map<String, Object> updates) {
        return ApiResponse.success(userService.updateProfile(updates), "User profile updated successfully");
    }

    private final StorageService storageService;

    @PatchMapping("/profile-picture")
    @Operation(summary = "Update Profile Picture", description = "Updates the profile picture URL for the current user")
    public ApiResponse<UserResponse> updateProfilePicture(@RequestBody Map<String, String> body) {
        String url = body.get("url");
        if (url == null) {
            throw new RuntimeException("Profile picture URL is required");
        }
        return ApiResponse.success(userService.updateProfilePicture(url), "Profile picture updated successfully");
    }

    @PostMapping(value = "/profile-picture", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload Profile Picture", description = "Uploads profile picture file and updates user profile")
    public ApiResponse<UserResponse> uploadProfilePicture(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            String storagePath = storageService.store(file.getInputStream(), file.getOriginalFilename(), file.getContentType());
            java.nio.file.Path pathObj = java.nio.file.Paths.get(storagePath);
            String id = pathObj.getFileName().toString();
            String url = "/api/files/download/" + id;
            return ApiResponse.success(userService.updateProfilePicture(url), "Profile picture uploaded successfully");
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to upload profile picture file", e);
        }
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change Password", description = "Changes password of current user")
    public ApiResponse<String> changePassword(@RequestBody Map<String, String> body) {
        // Accept both currentPassword (frontend) and oldPassword (legacy)
        String oldPassword = body.getOrDefault("currentPassword", body.get("oldPassword"));
        String newPassword = body.get("newPassword");
        if (oldPassword == null || newPassword == null) {
            throw new RuntimeException("Both currentPassword and newPassword are required");
        }
        userService.changePassword(oldPassword, newPassword);
        return ApiResponse.success("Password changed successfully", "Password changed successfully");
    }

    @PostMapping("/deactivate")
    @Operation(summary = "Deactivate Account", description = "Deactivates current user account")
    public ApiResponse<String> deactivateAccount() {
        userService.deactivateAccount();
        return ApiResponse.success("Account deactivated successfully", "Account deactivated successfully");
    }

    @GetMapping("/login-history")
    @Operation(summary = "Get Login History", description = "Gets login history logs for current user")
    public ApiResponse<java.util.List<com.meetrivo.model.LoginHistory>> getLoginHistory() {
        return ApiResponse.success(userService.getLoginHistory(), "Login history retrieved successfully");
    }
}
