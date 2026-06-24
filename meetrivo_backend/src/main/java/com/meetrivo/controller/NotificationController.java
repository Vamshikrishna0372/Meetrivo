package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.model.Notification;
import com.meetrivo.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Endpoints for retrieving and managing user notifications")
public class NotificationController {

    private final NotificationService notificationService;

    // ─── Get All Notifications ────────────────────────────────────────────────

    @GetMapping
    @Operation(summary = "Get Notifications", description = "Returns all notifications for the authenticated user, ordered by creation time descending.")
    public ApiResponse<List<Notification>> getNotifications() {
        List<Notification> notifications = notificationService.getNotifications();
        return ApiResponse.success(notifications, "Notifications retrieved successfully");
    }

    // ─── Mark Single Notification as Read ────────────────────────────────────

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark Notification as Read", description = "Marks a specific notification as read. Only the owning user can mark their notifications.")
    public ApiResponse<Notification> markAsRead(@PathVariable String id) {
        Notification notification = notificationService.markAsRead(id);
        return ApiResponse.success(notification, "Notification marked as read");
    }

    // ─── Mark All Notifications as Read ──────────────────────────────────────

    @PutMapping("/read-all")
    @Operation(summary = "Mark All as Read", description = "Marks all unread notifications for the authenticated user as read in a single operation.")
    public ApiResponse<String> markAllAsRead() {
        notificationService.markAllAsRead();
        return ApiResponse.success("All notifications marked as read", "Success");
    }
}
