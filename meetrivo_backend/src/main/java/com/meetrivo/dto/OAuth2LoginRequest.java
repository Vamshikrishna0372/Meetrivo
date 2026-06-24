package com.meetrivo.dto;

import com.meetrivo.model.AuthProvider;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OAuth2LoginRequest {
    @NotNull(message = "Provider is required")
    private AuthProvider provider;
    
    @NotBlank(message = "Provider User ID is required")
    private String providerUserId;
    
    @NotBlank(message = "Email is required")
    private String email;
    
    private String fullName;
    
    private String profilePicture;
}
