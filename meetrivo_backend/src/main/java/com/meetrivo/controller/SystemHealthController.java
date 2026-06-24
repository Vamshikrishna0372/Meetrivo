package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.util.ApplicationConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.RuntimeMXBean;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/system")
@RequiredArgsConstructor
@Tag(name = "System Health", description = "Liveness, readiness, and deep health checks for production monitoring")
public class SystemHealthController {

    private final MongoTemplate mongoTemplate;

    // ─── Liveness ─────────────────────────────────────────────────────────────
    // Used by Kubernetes livenessProbe — returns UP if the JVM is alive

    @GetMapping("/liveness")
    @Operation(summary = "Liveness Probe", description = "Returns UP if the application process is running (used by K8s liveness probe)")
    public ApiResponse<Map<String, Object>> liveness() {
        return ApiResponse.success(Map.of(
            "status", "UP",
            "timestamp", LocalDateTime.now().toString()
        ), "Application is alive");
    }

    // ─── Readiness ────────────────────────────────────────────────────────────
    // Used by Kubernetes readinessProbe — verifies DB connectivity before receiving traffic

    @GetMapping("/readiness")
    @Operation(summary = "Readiness Probe", description = "Returns READY if the application and its dependencies are ready to serve traffic")
    public ApiResponse<Map<String, Object>> readiness() {
        Map<String, Object> result = new LinkedHashMap<>();
        boolean ready = true;

        // Check MongoDB
        String dbStatus;
        try {
            mongoTemplate.executeCommand("{ ping: 1 }");
            dbStatus = "UP";
        } catch (Exception e) {
            dbStatus = "DOWN";
            ready = false;
        }

        result.put("status", ready ? "READY" : "NOT_READY");
        result.put("database", dbStatus);
        result.put("timestamp", LocalDateTime.now().toString());

        return ApiResponse.success(result, ready ? "Application is ready" : "Application is not ready");
    }

    // ─── Deep Health ──────────────────────────────────────────────────────────
    // Comprehensive health snapshot for ops dashboards and monitoring tools

    @GetMapping("/health")
    @Operation(summary = "System Health", description = "Returns detailed health info including JVM memory, uptime, database status, and environment")
    public ApiResponse<Map<String, Object>> health() {
        Map<String, Object> health = new LinkedHashMap<>();

        // Application info
        health.put("application", ApplicationConstants.APP_NAME);
        health.put("version", ApplicationConstants.API_VERSION);
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now().toString());

        // JVM info
        RuntimeMXBean runtimeBean = ManagementFactory.getRuntimeMXBean();
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        long uptimeMs = runtimeBean.getUptime();

        Map<String, Object> jvm = new LinkedHashMap<>();
        jvm.put("uptimeSeconds", uptimeMs / 1000);
        jvm.put("heapUsedMb", memoryBean.getHeapMemoryUsage().getUsed() / (1024 * 1024));
        jvm.put("heapMaxMb", memoryBean.getHeapMemoryUsage().getMax() / (1024 * 1024));
        jvm.put("processors", Runtime.getRuntime().availableProcessors());
        health.put("jvm", jvm);

        // Database health
        Map<String, Object> db = new LinkedHashMap<>();
        try {
            mongoTemplate.executeCommand("{ ping: 1 }");
            db.put("status", "UP");
            db.put("type", "MongoDB");
        } catch (Exception e) {
            db.put("status", "DOWN");
            db.put("error", e.getMessage());
        }
        health.put("database", db);

        return ApiResponse.success(health, "System health retrieved successfully");
    }
}
