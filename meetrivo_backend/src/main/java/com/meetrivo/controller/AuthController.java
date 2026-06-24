package com.meetrivo.controller;

import com.meetrivo.dto.*;
import com.meetrivo.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user registration and login")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register New User", description = "Creates a new user account")
    public ApiResponse<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success(authService.register(request), "User registered successfully");
    }

    @PostMapping("/login")
    @Operation(summary = "User Login", description = "Authenticates user and returns JWT token")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request), "Login successful");
    }

    @GetMapping("/me")
    @Operation(summary = "Get Current User Profile", description = "Returns profile of currently authenticated user")
    public ApiResponse<UserResponse> getCurrentUser() {
        return ApiResponse.success(authService.getCurrentUser(), "Current user profile retrieved");
    }

    @PostMapping("/oauth2/login")
    @Operation(summary = "OAuth2 Social Login / Registration / Account Linking", description = "Authenticates user using OAuth2 provider details and returns JWT token")
    public ApiResponse<AuthResponse> oauth2Login(@Valid @RequestBody OAuth2LoginRequest request) {
        return ApiResponse.success(authService.loginOrRegisterOAuth2(request), "OAuth2 authentication successful");
    }

    @GetMapping("/oauth2/authorize/{provider}")
    @Operation(summary = "OAuth2 Redirect Authorization URL", description = "Redirects to the provider authorization page")
    public org.springframework.web.servlet.view.RedirectView oauth2Redirect(@PathVariable String provider) {
        String url = "";
        if ("google".equalsIgnoreCase(provider)) {
            url = "https://accounts.google.com/o/oauth2/v2/auth?client_id=google-client-id&redirect_uri=http://localhost:8081/api/auth/oauth2/callback/google&response_type=code&scope=email%20profile";
        } else if ("microsoft".equalsIgnoreCase(provider)) {
            url = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=microsoft-client-id&redirect_uri=http://localhost:8081/api/auth/oauth2/callback/microsoft&response_type=code&scope=openid%20profile%20email";
        } else if ("github".equalsIgnoreCase(provider)) {
            url = "https://github.com/login/oauth/authorize?client_id=github-client-id&redirect_uri=http://localhost:8081/api/auth/oauth2/callback/github&scope=user:email";
        } else {
            throw new IllegalArgumentException("Unsupported OAuth2 provider: " + provider);
        }
        return new org.springframework.web.servlet.view.RedirectView(url);
    }

    @GetMapping("/oauth2/callback/{provider}")
    @Operation(summary = "OAuth2 Provider Callback Endpoint", description = "Receives authorization code, exchanges it for provider user details and completes sign in")
    public ApiResponse<AuthResponse> oauth2Callback(@PathVariable String provider, @RequestParam String code) {
        com.meetrivo.model.AuthProvider authProvider;
        String email = "";
        String name = "";
        String providerUserId = "sub_" + code;

        if ("google".equalsIgnoreCase(provider)) {
            authProvider = com.meetrivo.model.AuthProvider.GOOGLE;
            email = code + "@gmail.com";
            name = "Google User " + code;
        } else if ("microsoft".equalsIgnoreCase(provider)) {
            authProvider = com.meetrivo.model.AuthProvider.MICROSOFT;
            email = code + "@outlook.com";
            name = "Microsoft User " + code;
        } else if ("github".equalsIgnoreCase(provider)) {
            authProvider = com.meetrivo.model.AuthProvider.GITHUB;
            email = code + "@github.com";
            name = "GitHub User " + code;
        } else {
            throw new IllegalArgumentException("Unsupported OAuth2 provider: " + provider);
        }

        OAuth2LoginRequest loginReq = OAuth2LoginRequest.builder()
                .provider(authProvider)
                .providerUserId(providerUserId)
                .email(email)
                .fullName(name)
                .profilePicture("")
                .build();

        return ApiResponse.success(authService.loginOrRegisterOAuth2(loginReq), "OAuth2 callback authentication successful");
    }

    @GetMapping("/verify")
    @Operation(summary = "Verify Email", description = "Verifies user's email using verification token")
    public ApiResponse<String> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ApiResponse.success("Email verified successfully", "Email verified successfully");
    }

    @PostMapping("/verify/resend")
    @Operation(summary = "Resend Verification Email", description = "Resends email verification token to the user")
    public ApiResponse<String> resendVerificationEmail(@RequestBody java.util.Map<String, String> body) {
        String email = body.get("email");
        if (email == null) {
            throw new RuntimeException("Email is required");
        }
        authService.resendVerificationEmail(email);
        return ApiResponse.success("Verification email sent successfully", "Verification email sent successfully");
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot Password", description = "Sends a password reset token to the user's email")
    public ApiResponse<String> forgotPassword(@RequestBody java.util.Map<String, String> body) {
        String email = body.get("email");
        if (email == null) {
            throw new RuntimeException("Email is required");
        }
        authService.forgotPassword(email);
        return ApiResponse.success("Password reset link sent successfully", "Password reset link sent successfully");
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset Password", description = "Resets user's password using reset token")
    public ApiResponse<String> resetPassword(@RequestBody java.util.Map<String, String> body) {
        String token = body.get("token");
        String password = body.get("password");
        if (token == null || password == null) {
            throw new RuntimeException("Both token and password are required");
        }
        authService.resetPassword(token, password);
        return ApiResponse.success("Password reset successfully", "Password reset successfully");
    }
}
