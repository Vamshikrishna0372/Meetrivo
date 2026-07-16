package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.model.AuditLog;
import com.meetrivo.model.Role;
import com.meetrivo.model.User;
import com.meetrivo.service.PlatformAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Tag(name = "User Management & Moderation", description = "Endpoints for platform administrators to moderate user accounts and roles.")
public class AdminUserController {

    private final PlatformAdminService adminService;

    // ─── List & Search ────────────────────────────────────────────────────────

    @GetMapping
    @Operation(summary = "List Users", description = "Returns all users with optional search, role, status, org, team, department, emailVerified, sort filters.")
    public ApiResponse<List<User>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String organization,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String team,
            @RequestParam(required = false) String emailVerified,
            @RequestParam(required = false, defaultValue = "fullName") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir) {
        List<User> users = adminService.getAllUsers(search, role, status, sortBy, sortDir,
                organization, department, team, emailVerified);
        return ApiResponse.success(users, "Users list retrieved successfully");
    }

    // ─── Single User ──────────────────────────────────────────────────────────

    @PostMapping
    @Operation(summary = "Create User", description = "Creates a new user without automatically assigning them to the admin's organization.")
    public ApiResponse<User> createUser(@RequestBody User user) {
        return ApiResponse.success(adminService.createUser(user), "User created successfully");
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get User details")
    public ApiResponse<User> getUserById(@PathVariable String userId) {
        return ApiResponse.success(adminService.getUserById(userId), "User details retrieved successfully");
    }

    @PutMapping("/{userId}")
    @Operation(summary = "Update User Profile")
    public ApiResponse<User> updateUser(@PathVariable String userId, @RequestBody User updates) {
        return ApiResponse.success(adminService.updateUser(userId, updates), "User updated successfully");
    }

    @DeleteMapping("/{userId}")
    @Operation(summary = "Delete User", description = "Permanently deletes a user. Super Admin only.")
    public ApiResponse<String> deleteUser(@PathVariable String userId) {
        adminService.deleteUser(userId);
        return ApiResponse.success("User deleted successfully", "Success");
    }

    // ─── Status & Role ────────────────────────────────────────────────────────

    @PutMapping("/{userId}/role")
    @Operation(summary = "Update User Role")
    public ApiResponse<User> updateUserRole(@PathVariable String userId, @RequestParam Role role) {
        return ApiResponse.success(adminService.updateUserRole(userId, role), "User role updated successfully");
    }

    @PutMapping("/{userId}/activate")
    @Operation(summary = "Activate User")
    public ApiResponse<User> activateUser(@PathVariable String userId) {
        return ApiResponse.success(adminService.activateUser(userId), "User activated successfully");
    }

    @PutMapping("/{userId}/deactivate")
    @Operation(summary = "Deactivate User")
    public ApiResponse<User> deactivateUser(@PathVariable String userId) {
        return ApiResponse.success(adminService.deactivateUser(userId), "User deactivated successfully");
    }

    @PutMapping("/{userId}/suspend")
    @Operation(summary = "Suspend User")
    public ApiResponse<User> suspendUser(@PathVariable String userId) {
        return ApiResponse.success(adminService.suspendUser(userId), "User suspended successfully");
    }

    @PutMapping("/{userId}/block")
    @Operation(summary = "Block User")
    public ApiResponse<User> blockUser(@PathVariable String userId) {
        return ApiResponse.success(adminService.blockUser(userId), "User blocked successfully");
    }

    @PutMapping("/{userId}/unblock")
    @Operation(summary = "Unblock User")
    public ApiResponse<User> unblockUser(@PathVariable String userId) {
        return ApiResponse.success(adminService.unblockUser(userId), "User unblocked successfully");
    }

    @PutMapping("/{userId}/verify-email")
    @Operation(summary = "Force-verify Email")
    public ApiResponse<User> verifyEmail(@PathVariable String userId) {
        return ApiResponse.success(adminService.verifyUserEmail(userId), "Email verified successfully");
    }

    @PostMapping("/{userId}/reset-password")
    @Operation(summary = "Admin Reset Password", description = "Forces a password reset for a user. Super Admin only.")
    public ApiResponse<String> adminResetPassword(@PathVariable String userId, @RequestBody Map<String, String> body) {
        String newPassword = body.get("newPassword");
        if (newPassword == null || newPassword.isBlank()) {
            throw new RuntimeException("newPassword is required");
        }
        adminService.adminResetPassword(userId, newPassword);
        return ApiResponse.success("Password reset successfully", "Success");
    }

    // ─── Organization / Team / Department Assignment ──────────────────────────

    @PutMapping("/{userId}/assign-organization")
    @Operation(summary = "Assign Organization", description = "Assigns a user to an organization as a MEMBER.")
    public ApiResponse<String> assignOrganization(@PathVariable String userId, @RequestBody Map<String, String> body) {
        adminService.assignUserToOrganization(userId, body.get("organizationId"));
        return ApiResponse.success("User assigned to organization", "Success");
    }

    @PutMapping("/{userId}/assign-team")
    @Operation(summary = "Assign Team")
    public ApiResponse<String> assignTeam(@PathVariable String userId, @RequestBody Map<String, String> body) {
        adminService.assignUserToTeam(userId, body.get("teamId"));
        return ApiResponse.success("User assigned to team", "Success");
    }

    @PutMapping("/{userId}/assign-department")
    @Operation(summary = "Assign Department")
    public ApiResponse<String> assignDepartment(@PathVariable String userId, @RequestBody Map<String, String> body) {
        adminService.assignUserToDepartment(userId, body.get("departmentId"));
        return ApiResponse.success("User assigned to department", "Success");
    }

    // ─── Analytics ────────────────────────────────────────────────────────────

    @GetMapping("/{userId}/analytics")
    @Operation(summary = "User Analytics")
    public ApiResponse<Map<String, Object>> getUserAnalytics(@PathVariable String userId) {
        return ApiResponse.success(adminService.getUserAnalytics(userId), "User analytics retrieved successfully");
    }

    // ─── Activity Log ─────────────────────────────────────────────────────────

    @GetMapping("/{userId}/activity")
    @Operation(summary = "User Activity Log")
    public ApiResponse<List<AuditLog>> getUserActivity(
            @PathVariable String userId,
            @RequestParam(required = false, defaultValue = "100") int limit) {
        return ApiResponse.success(adminService.getUserActivity(userId, limit), "User activity retrieved successfully");
    }

    // ─── Login History ────────────────────────────────────────────────────────

    @GetMapping("/{userId}/login-history")
    @Operation(summary = "User Login History")
    public ApiResponse<List<com.meetrivo.model.LoginHistory>> getUserLoginHistory(@PathVariable String userId) {
        return ApiResponse.success(adminService.getUserLoginHistory(userId), "Login history retrieved successfully");
    }

    // ─── Bulk Actions ─────────────────────────────────────────────────────────

    @PostMapping("/bulk")
    @Operation(summary = "Bulk User Action", description = "Actions: delete | disable | enable | suspend | block | unblock | verify_email | assign_role | assign_organization | assign_team | assign_department")
    public ApiResponse<Map<String, Object>> bulkAction(@RequestBody Map<String, Object> payload) {
        @SuppressWarnings("unchecked")
        List<String> userIds = (List<String>) payload.get("userIds");
        String action        = (String) payload.get("action");
        String role          = (String) payload.getOrDefault("role", null);
        String targetId      = (String) payload.getOrDefault("targetId", null);
        Map<String, Object> result = adminService.bulkUserAction(userIds, action, role, targetId);
        return ApiResponse.success(result, "Bulk action completed");
    }

    // ─── Export ───────────────────────────────────────────────────────────────

    @GetMapping("/export/csv")
    @Operation(summary = "Export Users CSV")
    public ResponseEntity<String> exportCsv(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status) {
        String csv = adminService.exportUsersCsv(search, role, status);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "users.csv");
        return ResponseEntity.ok().headers(headers).body(csv);
    }
}
