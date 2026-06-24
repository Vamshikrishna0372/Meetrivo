package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
@Tag(name = "Platform Analytics", description = "Endpoints for platform-wide analytics and performance tracking. Admin only.")
public class AdminAnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/users")
    @Operation(summary = "User Analytics", description = "Returns active user stats, login counters, and trends.")
    public ApiResponse<Map<String, Object>> getUserAnalytics() {
        Map<String, Object> stats = analyticsService.getUserAnalytics();
        return ApiResponse.success(stats, "User analytics retrieved successfully");
    }

    @GetMapping("/meetings")
    @Operation(summary = "Meeting Analytics", description = "Returns meeting counters, duration averages, and features stats.")
    public ApiResponse<Map<String, Object>> getMeetingAnalytics() {
        Map<String, Object> stats = analyticsService.getMeetingAnalytics();
        return ApiResponse.success(stats, "Meeting analytics retrieved successfully");
    }

    @GetMapping("/billing")
    @Operation(
        summary = "Billing Analytics",
        description = "Returns billing and monetization stats: total revenue, active subscriptions, " +
                      "payment success rate, monthly growth, upgrades, cancellations, and refunds."
    )
    public ApiResponse<Map<String, Object>> getBillingAnalytics() {
        Map<String, Object> stats = analyticsService.getBillingAnalytics();
        return ApiResponse.success(stats, "Billing analytics retrieved successfully");
    }

    @GetMapping("/system")
    @Operation(summary = "System Analytics", description = "Consolidates all system analytics indicators including billing.")
    public ApiResponse<Map<String, Object>> getSystemAnalytics() {
        Map<String, Object> stats = analyticsService.getSystemAnalytics();
        return ApiResponse.success(stats, "System analytics retrieved successfully");
    }
}
