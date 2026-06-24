package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.util.ApplicationConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health Check", description = "Endpoints for verifying the health of the backend service")
public class HealthController {

    @GetMapping
    @Operation(summary = "Get Backend Health Status", description = "Returns basic health info of the running application")
    public ApiResponse<Map<String, Object>> getHealth() {
        Map<String, Object> healthInfo = Map.of(
            "version", ApplicationConstants.API_VERSION,
            "status", "UP"
        );
        
        return ApiResponse.success(healthInfo, ApplicationConstants.HEALTH_CHECK_SUCCESS);
    }
}
