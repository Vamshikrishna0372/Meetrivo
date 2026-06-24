package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.dto.DashboardStatsResponse;
import com.meetrivo.model.AuditLog;
import com.meetrivo.service.PlatformAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@Tag(name = "Admin Dashboard", description = "Endpoints for retrieving admin platform statistics and activity logs.")
public class AdminDashboardController {

    private final PlatformAdminService adminService;

    @GetMapping("/stats")
    @Operation(summary = "Get Dashboard Stats", description = "Returns system counters (users, meetings, recordings, etc.).")
    public ApiResponse<DashboardStatsResponse> getStats() {
        DashboardStatsResponse stats = adminService.getStats();
        return ApiResponse.success(stats, "Dashboard statistics retrieved successfully");
    }

    @GetMapping("/activity")
    @Operation(summary = "Get Activity Log", description = "Returns recent platform audit log entries.")
    public ApiResponse<List<AuditLog>> getActivity() {
        List<AuditLog> activity = adminService.getRecentActivity();
        return ApiResponse.success(activity, "Recent activity logs retrieved successfully");
    }
}
