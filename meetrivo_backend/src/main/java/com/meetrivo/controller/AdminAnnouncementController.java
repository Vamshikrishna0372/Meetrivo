package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.model.Announcement;
import com.meetrivo.service.PlatformAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/announcements")
@RequiredArgsConstructor
@Tag(name = "Platform Announcements", description = "Endpoints for managing and publishing system announcements.")
public class AdminAnnouncementController {

    private final PlatformAdminService adminService;

    @PostMapping
    @Operation(summary = "Publish Announcement", description = "Creates a new system-wide announcement and broadcasts it to all users.")
    public ApiResponse<Announcement> createAnnouncement(@RequestBody Announcement announcement) {
        Announcement saved = adminService.createAnnouncement(announcement);
        return ApiResponse.success(saved, "Announcement published successfully");
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Announcement", description = "Updates content or priority of an existing announcement.")
    public ApiResponse<Announcement> updateAnnouncement(@PathVariable String id, @RequestBody Announcement updates) {
        Announcement updated = adminService.updateAnnouncement(id, updates);
        return ApiResponse.success(updated, "Announcement updated successfully");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Announcement", description = "Deletes a system announcement.")
    public ApiResponse<String> deleteAnnouncement(@PathVariable String id) {
        adminService.deleteAnnouncement(id);
        return ApiResponse.success("Announcement deleted successfully", "Success");
    }

    @GetMapping
    @Operation(summary = "Get Announcements", description = "Retrieves all announcements published on the platform.")
    public ApiResponse<List<Announcement>> getAnnouncements() {
        List<Announcement> announcements = adminService.getAllAnnouncements();
        return ApiResponse.success(announcements, "Announcements retrieved successfully");
    }
}
