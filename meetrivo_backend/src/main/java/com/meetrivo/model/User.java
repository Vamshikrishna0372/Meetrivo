package com.meetrivo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User implements UserDetails {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    @Indexed(unique = true)
    private String username;

    private String fullName;
    private String password;
    private String profilePicture;
    private String bio;

    private String phone;
    private String timezone;
    private String country;
    private String language;

    @org.springframework.data.annotation.Transient
    private String organizationId;
    @org.springframework.data.annotation.Transient
    private String organizationName;
    @org.springframework.data.annotation.Transient
    private String departmentId;
    @org.springframework.data.annotation.Transient
    private String departmentName;
    @org.springframework.data.annotation.Transient
    private String teamId;
    @org.springframework.data.annotation.Transient
    private String teamName;
    @org.springframework.data.annotation.Transient
    private boolean online;
    @org.springframework.data.annotation.Transient
    private LocalDateTime lastActivityAt;

    @Builder.Default
    private Role role = Role.MEMBER;

    @Builder.Default
    private AccountStatus accountStatus = AccountStatus.PENDING_VERIFICATION;

    @Builder.Default
    private boolean emailVerified = false;

    private String verificationToken;

    @Builder.Default
    private UserPreferences preferences = new UserPreferences();

    private String resetPasswordToken;
    private LocalDateTime resetPasswordTokenExpiry;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime lastLoginAt;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountStatus != AccountStatus.BLOCKED && accountStatus != AccountStatus.SUSPENDED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return accountStatus == AccountStatus.ACTIVE || accountStatus == AccountStatus.PENDING_VERIFICATION;
    }
}
