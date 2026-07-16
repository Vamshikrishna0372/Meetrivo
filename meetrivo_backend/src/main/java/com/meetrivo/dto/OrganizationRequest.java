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
    
    // New fields for Phase 5B
    private String ownerName;
    @NotBlank(message = "Owner email is required")
    private String ownerEmail;
    @NotBlank(message = "Temporary password is required")
    private String temporaryPassword;
    private String phone;
    private String industry;
    private String companySize;
    private String country;
    private String timezone;
}
