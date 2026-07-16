package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.dto.AuthResponse;
import com.meetrivo.dto.LoginRequest;
import com.meetrivo.dto.OAuth2LoginRequest;
import com.meetrivo.dto.RegisterRequest;
import com.meetrivo.dto.UserResponse;
import com.meetrivo.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user authentication and registration")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register User", description = "Registers a new user on the platform")
    public ApiResponse<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success(authService.register(request), "User registered successfully. Please check your email to verify your account.");
    }

    @PostMapping("/login")
    @Operation(summary = "Login User", description = "Authenticates a user and returns a JWT token")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request), "Logged in successfully");
    }

    @GetMapping("/me")
    @Operation(summary = "Get Current User", description = "Returns the currently authenticated user details based on JWT")
    public ApiResponse<UserResponse> getCurrentUser() {
        return ApiResponse.success(authService.getCurrentUser(), "Current user retrieved");
    }

    @PostMapping("/oauth2/login")
    @Operation(summary = "OAuth2 Login", description = "Logs in or registers a user via OAuth2 provider (Google, GitHub, etc.)")
    public ApiResponse<AuthResponse> loginOrRegisterOAuth2(@Valid @RequestBody OAuth2LoginRequest request) {
        return ApiResponse.success(authService.loginOrRegisterOAuth2(request), "OAuth2 login successful");
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Verify Email", description = "Verifies a user's email address using the token sent to their email")
    public ApiResponse<String> verifyEmail(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        if (token == null || token.isBlank()) {
            throw new RuntimeException("Verification token is required");
        }
        authService.verifyEmail(token);
        return ApiResponse.success("Email verified successfully", "Email verified successfully");
    }

    @PostMapping("/resend-verification")
    @Operation(summary = "Resend Verification Email", description = "Resends the email verification token")
    public ApiResponse<String> resendVerification(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required");
        }
        authService.resendVerificationEmail(email);
        return ApiResponse.success("Verification email resent", "Verification email resent");
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot Password", description = "Sends a password reset link to the user's email")
    public ApiResponse<String> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required");
        }
        authService.forgotPassword(email);
        return ApiResponse.success("Password reset email sent", "Password reset email sent");
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset Password", description = "Resets the user's password using the token sent to their email")
    public ApiResponse<String> resetPassword(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        String newPassword = payload.get("newPassword");
        if (token == null || token.isBlank() || newPassword == null || newPassword.isBlank()) {
            throw new RuntimeException("Token and newPassword are required");
        }
        authService.resetPassword(token, newPassword);
        return ApiResponse.success("Password reset successfully", "Password reset successfully");
    }
}
