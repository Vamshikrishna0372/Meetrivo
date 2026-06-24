package com.meetrivo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TeamRequest {
    @NotBlank(message = "Organization ID is required")
    private String organizationId;
    @NotBlank(message = "Team name is required")
    private String name;
    private String description;
    private String managerId;
}
