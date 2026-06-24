package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.model.MobileDevice;
import com.meetrivo.model.MobilePlatform;
import com.meetrivo.model.User;
import com.meetrivo.service.MobileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mobile")
@RequiredArgsConstructor
@Tag(name = "Mobile", description = "Mobile device registration and push notification endpoints for Android and iOS")
public class MobileController {

    private final MobileService mobileService;

    // ─── Register Device ──────────────────────────────────────────────────────

    @PostMapping("/register-device")
    @Operation(
        summary = "Register Mobile Device",
        description = "Registers a mobile device (Android or iOS) for the authenticated user to receive push notifications. " +
                      "If the device token is already registered, it updates the existing record (upsert behaviour)."
    )
    public ApiResponse<MobileDevice> registerDevice(
            @AuthenticationPrincipal User currentUser,
            @RequestBody Map<String, String> request) {
        String deviceToken = request.get("deviceToken");
        String platformStr  = request.get("platform");
        String deviceName   = request.get("deviceName");

        if (deviceToken == null || deviceToken.isBlank()) {
            return ApiResponse.error("deviceToken is required");
        }
        if (platformStr == null || platformStr.isBlank()) {
            return ApiResponse.error("platform is required (ANDROID or IOS)");
        }

        MobilePlatform platform;
        try {
            platform = MobilePlatform.valueOf(platformStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ApiResponse.error("Invalid platform. Accepted values: ANDROID, IOS");
        }

        MobileDevice device = mobileService.registerDevice(
                currentUser.getId(), deviceToken, platform, deviceName);
        return ApiResponse.success(device, "Device registered successfully");
    }

    // ─── Remove Device ────────────────────────────────────────────────────────

    @DeleteMapping("/remove-device")
    @Operation(
        summary = "Remove Mobile Device",
        description = "Removes a registered device token for the authenticated user. " +
                      "The device will no longer receive push notifications."
    )
    public ApiResponse<String> removeDevice(
            @AuthenticationPrincipal User currentUser,
            @RequestBody Map<String, String> request) {
        String deviceToken = request.get("deviceToken");
        if (deviceToken == null || deviceToken.isBlank()) {
            return ApiResponse.error("deviceToken is required");
        }
        mobileService.removeDevice(currentUser.getId(), deviceToken);
        return ApiResponse.success("Device removed successfully", "Device unregistered");
    }

    // ─── Get Registered Devices ───────────────────────────────────────────────

    @GetMapping("/devices")
    @Operation(
        summary = "Get Registered Devices",
        description = "Returns all mobile devices registered by the authenticated user."
    )
    public ApiResponse<List<MobileDevice>> getDevices(@AuthenticationPrincipal User currentUser) {
        List<MobileDevice> devices = mobileService.getUserDevices(currentUser.getId());
        return ApiResponse.success(devices, "Devices retrieved successfully");
    }

    // ─── Test Notification ────────────────────────────────────────────────────

    @PostMapping("/test-notification")
    @Operation(
        summary = "Send Test Push Notification",
        description = "Sends a test push notification to a specific registered device of the authenticated user. " +
                      "Use this to verify push notification setup and device token validity."
    )
    public ApiResponse<String> testNotification(
            @AuthenticationPrincipal User currentUser,
            @RequestBody Map<String, String> request) {
        String deviceToken = request.get("deviceToken");
        if (deviceToken == null || deviceToken.isBlank()) {
            return ApiResponse.error("deviceToken is required");
        }
        mobileService.sendTestNotification(currentUser.getId(), deviceToken);
        return ApiResponse.success("Test notification dispatched", "Push notification sent successfully");
    }

    // ─── Send Push Notification (Internal/Admin Use) ──────────────────────────

    @PostMapping("/send-notification")
    @Operation(
        summary = "Send Push Notification",
        description = "Sends a push notification to all devices registered by the authenticated user. " +
                      "Supports notification types: MEETING_REMINDER, INVITATION, RECORDING_READY, CHAT_MESSAGE, ORGANIZATION_NOTIFICATION."
    )
    public ApiResponse<String> sendNotification(
            @AuthenticationPrincipal User currentUser,
            @RequestBody Map<String, String> request) {
        String title = request.get("title");
        String body  = request.get("body");
        String type  = request.getOrDefault("type", "GENERAL");

        if (title == null || title.isBlank() || body == null || body.isBlank()) {
            return ApiResponse.error("title and body are required");
        }

        mobileService.sendPushNotification(currentUser.getId(), title, body, type);
        return ApiResponse.success("Push notification sent", "Notification dispatched to all registered devices");
    }
}
