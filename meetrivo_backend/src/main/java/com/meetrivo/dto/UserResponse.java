package com.meetrivo.dto;

import com.meetrivo.model.AccountStatus;
import com.meetrivo.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private String id;
    private String email;
    private String username;
    private String fullName;
    private String profilePicture;
    private String bio;
    private Role role;
    private AccountStatus accountStatus;
    private boolean emailVerified;
    private com.meetrivo.model.UserPreferences preferences;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoginAt;
}
