package com.meetrivo.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meetrivo.dto.ApiResponse;
import com.meetrivo.model.User;
import com.meetrivo.service.RateLimitingService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimitingService rateLimitingService;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Bypass rate limiting for OPTIONS preflight and WebSocket connections
        if ("OPTIONS".equalsIgnoreCase(method) || path.startsWith("/ws")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 1. Resolve Identifier (IP or User ID)
        String identifier = request.getRemoteAddr();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAuthenticated = auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof User;
        if (isAuthenticated) {
            identifier = ((User) auth.getPrincipal()).getId();
        }

        // 2. Set limits based on endpoints
        String rateLimitKey;
        int limit;
        int duration = 60; // 1 minute

        if (path.startsWith("/api/auth/")) {
            rateLimitKey = "ratelimit:auth:" + identifier;
            limit = 15; // 15 auth requests per min
        } else if (path.startsWith("/api/meetings") && "POST".equalsIgnoreCase(method)) {
            rateLimitKey = "ratelimit:meeting_create:" + identifier;
            limit = 5; // 5 meeting creations per min
        } else if (path.startsWith("/api/chat") && "POST".equalsIgnoreCase(method)) {
            rateLimitKey = "ratelimit:chat_send:" + identifier;
            limit = 30; // 30 messages per min (spam prevention)
        } else {
            rateLimitKey = "ratelimit:general:" + identifier;
            limit = 120; // 120 general requests per min
        }

        // 3. Enforce rate limit
        boolean allowed = rateLimitingService.isAllowed(rateLimitKey, limit, duration);
        if (!allowed) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            
            ApiResponse<Object> apiResponse = ApiResponse.error("Too many requests. Please try again later.");
            response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
            return;
        }

        filterChain.doFilter(request, response);
    }
}
