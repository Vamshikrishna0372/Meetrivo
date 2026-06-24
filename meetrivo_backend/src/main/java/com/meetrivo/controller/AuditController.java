package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.model.AuditLog;
import com.meetrivo.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Platform Audit Logs", description = "Endpoints for viewing and searching system audit logs. Admin only.")
public class AuditController {

    private final AuditLogService auditLogService;

    @GetMapping
    @Operation(summary = "Get Audit Logs", description = "Retrieves all audit logs ordered by timestamp descending.")
    public ApiResponse<List<AuditLog>> getAuditLogs() {
        List<AuditLog> logs = auditLogService.getAllLogs();
        return ApiResponse.success(logs, "Audit logs retrieved successfully");
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Audit Log by ID", description = "Retrieves details of a specific audit log by its ID.")
    public ApiResponse<AuditLog> getAuditLogById(@PathVariable String id) {
        AuditLog log = auditLogService.getLogById(id);
        return ApiResponse.success(log, "Audit log retrieved successfully");
    }
}
