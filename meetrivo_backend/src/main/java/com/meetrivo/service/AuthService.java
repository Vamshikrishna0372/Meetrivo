package com.meetrivo.service;

import com.meetrivo.dto.*;
import com.meetrivo.model.AccountStatus;
import com.meetrivo.model.AnalyticsEventType;
import com.meetrivo.model.User;
import com.meetrivo.repository.UserRepository;
import com.meetrivo.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService extends BaseService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AnalyticsService analyticsService;
    private final com.meetrivo.repository.SocialAccountRepository socialAccountRepository;
    private final com.meetrivo.repository.LoginHistoryRepository loginHistoryRepository;
    private final MailService mailService;

    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        String verificationToken = java.util.UUID.randomUUID().toString();
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .fullName(request.getFullName())
                .password(passwordEncoder.encode(request.getPassword()))
                .accountStatus(AccountStatus.PENDING_VERIFICATION)
                .emailVerified(false)
                .verificationToken(verificationToken)
                .build();

        User savedUser = userRepository.save(user);
        analyticsService.trackEvent(AnalyticsEventType.USER_REGISTER, savedUser.getId(), null, null);
        logInfo("User registered successfully: " + savedUser.getUsername());
        
        try {
            mailService.sendVerificationEmail(savedUser.getEmail(), savedUser.getUsername(), verificationToken);
        } catch (Exception e) {
            logError("Failed to send initial verification email to " + savedUser.getEmail(), e);
        }

        return mapToUserResponse(savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getLogin(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getLogin())
                .or(() -> userRepository.findByEmail(request.getLogin()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        loginHistoryRepository.save(com.meetrivo.model.LoginHistory.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .loginTime(LocalDateTime.now())
                .ipAddress("127.0.0.1")
                .userAgent("Web Application")
                .status("SUCCESS")
                .build());

        analyticsService.trackEvent(AnalyticsEventType.USER_LOGIN, user.getId(), null, null);
        String jwtToken = jwtService.generateToken(user);
        logInfo("User logged in successfully: " + user.getUsername());
        
        return AuthResponse.builder()
                .token(jwtToken)
                .user(mapToUserResponse(user))
                .build();
    }

    public UserResponse getCurrentUser() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return mapToUserResponse(user);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .profilePicture(user.getProfilePicture())
                .bio(user.getBio())
                .role(user.getRole())
                .accountStatus(user.getAccountStatus())
                .emailVerified(user.isEmailVerified())
                .preferences(user.getPreferences())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }

    public AuthResponse loginOrRegisterOAuth2(OAuth2LoginRequest request) {
        // Find existing social account link
        Optional<com.meetrivo.model.SocialAccount> socialOpt = socialAccountRepository.findByProviderAndProviderUserId(
                request.getProvider(), request.getProviderUserId()
        );

        User user;
        if (socialOpt.isPresent()) {
            // Already linked
            user = userRepository.findById(socialOpt.get().getUserId())
                    .orElseThrow(() -> new RuntimeException("Linked user not found"));

            // Profile synchronization
            synchronizeProfile(user, request);
        } else {
            // Check if user with this email already exists
            Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
            if (userOpt.isPresent()) {
                user = userOpt.get();
                // Profile synchronization
                synchronizeProfile(user, request);
            } else {
                // Register a new user
                String username = generateUniqueUsername(request.getEmail(), request.getFullName());
                user = User.builder()
                        .email(request.getEmail())
                        .username(username)
                        .fullName(request.getFullName() != null ? request.getFullName() : username)
                        .profilePicture(request.getProfilePicture())
                        .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                        .accountStatus(AccountStatus.ACTIVE)
                        .emailVerified(true)
                        .build();
                user = userRepository.save(user);
                analyticsService.trackEvent(AnalyticsEventType.USER_REGISTER, user.getId(), null, null);
                logInfo("Registered new OAuth2 user: " + user.getUsername());
            }

            // Create SocialAccount link
            com.meetrivo.model.SocialAccount socialAccount = com.meetrivo.model.SocialAccount.builder()
                    .userId(user.getId())
                    .provider(request.getProvider())
                    .providerUserId(request.getProviderUserId())
                    .email(request.getEmail())
                    .linkedAt(LocalDateTime.now())
                    .build();
            socialAccountRepository.save(socialAccount);
            logInfo("Linked provider " + request.getProvider() + " to user " + user.getUsername());
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        loginHistoryRepository.save(com.meetrivo.model.LoginHistory.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .loginTime(LocalDateTime.now())
                .ipAddress("127.0.0.1")
                .userAgent("OAuth2 Provider (" + request.getProvider() + ")")
                .status("SUCCESS")
                .build());

        analyticsService.trackEvent(AnalyticsEventType.USER_LOGIN, user.getId(), null, null);
        String jwtToken = jwtService.generateToken(user);
        logInfo("OAuth2 User logged in successfully: " + user.getUsername());

        return AuthResponse.builder()
                .token(jwtToken)
                .user(mapToUserResponse(user))
                .build();
    }

    private void synchronizeProfile(User user, OAuth2LoginRequest request) {
        boolean updated = false;
        if (user.getFullName() == null || user.getFullName().trim().isEmpty() || user.getFullName().startsWith("user_")) {
            if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
                user.setFullName(request.getFullName());
                updated = true;
            }
        }
        if (user.getProfilePicture() == null || user.getProfilePicture().trim().isEmpty()) {
            if (request.getProfilePicture() != null && !request.getProfilePicture().trim().isEmpty()) {
                user.setProfilePicture(request.getProfilePicture());
                updated = true;
            }
        }
        if (updated) {
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
            logInfo("Synchronized user profile: " + user.getUsername());
        }
    }

    private String generateUniqueUsername(String email, String fullName) {
        String base = "";
        if (fullName != null && !fullName.trim().isEmpty()) {
            base = fullName.toLowerCase().replaceAll("[^a-z0-9]", "");
        } else if (email != null && email.contains("@")) {
            base = email.split("@")[0].toLowerCase().replaceAll("[^a-z0-9]", "");
        }
        if (base.isEmpty()) {
            base = "user";
        }

        String username = base;
        int count = 1;
        while (userRepository.existsByUsername(username)) {
            username = base + count;
            count++;
        }
        return username;
    }

    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired verification token"));
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        logInfo("Email verified successfully for user: " + user.getUsername());
    }

    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        if (user.isEmailVerified()) {
            throw new RuntimeException("Email is already verified");
        }
        String token = java.util.UUID.randomUUID().toString();
        user.setVerificationToken(token);
        userRepository.save(user);
        logInfo("Resent verification token for user: " + user.getUsername() + ", token: " + token);
        mailService.sendVerificationEmail(user.getEmail(), user.getUsername(), token);
    }

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        String token = java.util.UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordTokenExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);
        logInfo("Generated password reset token for user: " + user.getUsername() + ", token: " + token);
        mailService.sendResetPasswordEmail(user.getEmail(), user.getUsername(), token);
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));
        if (user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        logInfo("Password reset successfully for user: " + user.getUsername());
    }
}
