package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.model.PlatformSetting;
import com.meetrivo.service.PlatformAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
@Tag(name = "Settings Management", description = "Endpoints for managing system-wide configuration keys.")
public class AdminSettingController {

    private final PlatformAdminService adminService;

    @GetMapping
    @Operation(summary = "Get Platform Settings", description = "Retrieves all system platform settings.")
    public ApiResponse<List<PlatformSetting>> getSettings() {
        List<PlatformSetting> settings = adminService.getSettings();
        return ApiResponse.success(settings, "Platform settings retrieved successfully");
    }

    @PutMapping
    @Operation(summary = "Update Platform Setting", description = "Creates or updates a system configuration setting.")
    public ApiResponse<PlatformSetting> updateSetting(@RequestBody PlatformSetting setting) {
        PlatformSetting updated = adminService.updateSetting(setting);
        return ApiResponse.success(updated, "Platform setting updated successfully");
    }
}
