package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.model.Role;
import com.meetrivo.model.User;
import com.meetrivo.service.PlatformAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Tag(name = "User Management & Moderation", description = "Endpoints for platform administrators to moderate user accounts and roles.")
public class AdminUserController {

    private final PlatformAdminService adminService;

    @GetMapping
    @Operation(summary = "List Users", description = "Retrieves all registered platform users.")
    public ApiResponse<List<User>> getAllUsers() {
        List<User> users = adminService.getAllUsers();
        return ApiResponse.success(users, "Users list retrieved successfully");
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get User details", description = "Retrieves profile details of a user by their user ID.")
    public ApiResponse<User> getUserById(@PathVariable String userId) {
        User user = adminService.getUserById(userId);
        return ApiResponse.success(user, "User details retrieved successfully");
    }

    @PutMapping("/{userId}")
    @Operation(summary = "Update User Profile", description = "Updates a user's profile details.")
    public ApiResponse<User> updateUser(@PathVariable String userId, @RequestBody User updates) {
        User updated = adminService.updateUser(userId, updates);
        return ApiResponse.success(updated, "User updated successfully");
    }

    @DeleteMapping("/{userId}")
    @Operation(summary = "Delete User", description = "Permanently deletes a user from the platform. Super Admin only.")
    public ApiResponse<String> deleteUser(@PathVariable String userId) {
        adminService.deleteUser(userId);
        return ApiResponse.success("User deleted successfully", "Success");
    }

    @PutMapping("/{userId}/role")
    @Operation(summary = "Update User Role", description = "Modifies the role (USER, ADMIN, SUPER_ADMIN) of a user. Super Admin only.")
    public ApiResponse<User> updateUserRole(@PathVariable String userId, @RequestParam Role role) {
        User updated = adminService.updateUserRole(userId, role);
        return ApiResponse.success(updated, "User role updated successfully");
    }

    @PutMapping("/{userId}/activate")
    @Operation(summary = "Activate User", description = "Activates a deactivated/suspended user.")
    public ApiResponse<User> activateUser(@PathVariable String userId) {
        User updated = adminService.activateUser(userId);
        return ApiResponse.success(updated, "User activated successfully");
    }

    @PutMapping("/{userId}/deactivate")
    @Operation(summary = "Deactivate User", description = "Deactivates a user's account.")
    public ApiResponse<User> deactivateUser(@PathVariable String userId) {
        User updated = adminService.deactivateUser(userId);
        return ApiResponse.success(updated, "User deactivated successfully");
    }

    @PutMapping("/{userId}/suspend")
    @Operation(summary = "Suspend User", description = "Suspends a user account and notifies them.")
    public ApiResponse<User> suspendUser(@PathVariable String userId) {
        User updated = adminService.suspendUser(userId);
        return ApiResponse.success(updated, "User suspended successfully");
    }

    @PutMapping("/{userId}/block")
    @Operation(summary = "Block User", description = "Blocks a user account from logging in.")
    public ApiResponse<User> blockUser(@PathVariable String userId) {
        User updated = adminService.blockUser(userId);
        return ApiResponse.success(updated, "User blocked successfully");
    }

    @PutMapping("/{userId}/unblock")
    @Operation(summary = "Unblock User", description = "Unblocks a blocked user account.")
    public ApiResponse<User> unblockUser(@PathVariable String userId) {
        User updated = adminService.unblockUser(userId);
        return ApiResponse.success(updated, "User unblocked successfully");
    }
}
