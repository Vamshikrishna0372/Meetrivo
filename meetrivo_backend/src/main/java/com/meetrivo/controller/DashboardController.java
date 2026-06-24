package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.dto.DashboardResponse;
import com.meetrivo.model.Notification;
import com.meetrivo.model.ScheduledMeeting;
import com.meetrivo.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Endpoints for the authenticated user's meeting dashboard — upcoming, recent, and notifications")
public class DashboardController {

    private final DashboardService dashboardService;

    // ─── Full Dashboard ───────────────────────────────────────────────────────

    @GetMapping
    @Operation(
            summary = "Get Full Dashboard",
            description = "Returns a consolidated dashboard view: upcoming meetings, recent past meetings, " +
                          "latest 20 notifications, unread notification count, and total upcoming meeting count."
    )
    public ApiResponse<DashboardResponse> getDashboard() {
        DashboardResponse dashboard = dashboardService.getDashboard();
        return ApiResponse.success(dashboard, "Dashboard retrieved successfully");
    }

    // ─── Upcoming Meetings ────────────────────────────────────────────────────

    @GetMapping("/upcoming-meetings")
    @Operation(
            summary = "Upcoming Meetings",
            description = "Returns all meetings scheduled in the future for the authenticated user, ordered by start time ascending."
    )
    public ApiResponse<List<ScheduledMeeting>> getUpcomingMeetings() {
        List<ScheduledMeeting> meetings = dashboardService.getUpcomingMeetings();
        return ApiResponse.success(meetings, "Upcoming meetings retrieved successfully");
    }

    // ─── Recent Meetings ──────────────────────────────────────────────────────

    @GetMapping("/recent-meetings")
    @Operation(
            summary = "Recent Meetings",
            description = "Returns the 10 most recent past meetings for the authenticated user, ordered by start time descending."
    )
    public ApiResponse<List<ScheduledMeeting>> getRecentMeetings() {
        List<ScheduledMeeting> meetings = dashboardService.getRecentMeetings();
        return ApiResponse.success(meetings, "Recent meetings retrieved successfully");
    }

    // ─── Dashboard Notifications ──────────────────────────────────────────────

    @GetMapping("/notifications")
    @Operation(
            summary = "Dashboard Notifications",
            description = "Returns the latest 20 notifications for the authenticated user, ordered by creation time descending."
    )
    public ApiResponse<List<Notification>> getDashboardNotifications() {
        List<Notification> notifications = dashboardService.getDashboardNotifications();
        return ApiResponse.success(notifications, "Dashboard notifications retrieved successfully");
    }
}
