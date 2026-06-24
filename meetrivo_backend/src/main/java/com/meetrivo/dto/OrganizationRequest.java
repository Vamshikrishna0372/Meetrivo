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
public class OrganizationRequest {
    @NotBlank(message = "Organization name is required")
    private String name;
    private String description;
    private String logo;
    private String domain;
}
