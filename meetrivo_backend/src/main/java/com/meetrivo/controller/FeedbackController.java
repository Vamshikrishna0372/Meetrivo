package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.model.Feedback;
import com.meetrivo.service.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
@Tag(name = "Feedback Management", description = "Endpoints for collecting and reviewing user platform feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    @Operation(summary = "Submit Feedback", description = "Allows users to submit rating, category, and message feedback")
    public ApiResponse<Feedback> submitFeedback(@RequestBody Feedback feedback) {
        return ApiResponse.success(feedbackService.submitFeedback(feedback), "Feedback submitted successfully");
    }

    @GetMapping
    @Operation(summary = "Get All Feedback", description = "Retrieves all feedback records submitted to the platform. Access restricted to Admin.")
    public ApiResponse<List<Feedback>> getAllFeedback() {
        return ApiResponse.success(feedbackService.getAllFeedback(), "All feedback records retrieved");
    }

    @GetMapping("/my")
    @Operation(summary = "Get My Feedback", description = "Retrieves feedback records submitted by the current user")
    public ApiResponse<List<Feedback>> getMyFeedback() {
        return ApiResponse.success(feedbackService.getUserFeedback(), "My feedback records retrieved");
    }
}
