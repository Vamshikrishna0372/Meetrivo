package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.service.MonitoringService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/monitoring")
@RequiredArgsConstructor
@Tag(name = "Platform Monitoring", description = "Endpoints for checking system health, CPU/memory, database ping, and connections. Admin only.")
public class AdminMonitoringController {

    private final MonitoringService monitoringService;

    @GetMapping("/health")
    @Operation(summary = "System Health Status", description = "Retrieves MongoDB database status and service indicators.")
    public ApiResponse<Map<String, Object>> getHealth() {
        Map<String, Object> health = monitoringService.getSystemHealth();
        return ApiResponse.success(health, "Health check completed successfully");
    }

    @GetMapping("/metrics")
    @Operation(summary = "Performance Metrics", description = "Retrieves JVM memory, CPU load, and active connections.")
    public ApiResponse<Map<String, Object>> getMetrics() {
        Map<String, Object> metrics = monitoringService.getPerformanceMetrics();
        return ApiResponse.success(metrics, "Performance metrics retrieved successfully");
    }
}
