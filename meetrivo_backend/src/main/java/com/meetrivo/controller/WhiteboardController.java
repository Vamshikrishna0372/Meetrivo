package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.model.WhiteboardElement;
import com.meetrivo.service.WhiteboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/whiteboard")
@RequiredArgsConstructor
@Tag(name = "Whiteboard Management", description = "Endpoints for managing real-time collaborative whiteboard elements")
public class WhiteboardController {

    private final WhiteboardService whiteboardService;

    @GetMapping("/{meetingId}")
    @Operation(summary = "Get Whiteboard Elements", description = "Retrieves all active whiteboard elements for a specific meeting")
    public ApiResponse<List<WhiteboardElement>> getWhiteboard(@PathVariable String meetingId) {
        return ApiResponse.success(whiteboardService.getWhiteboard(meetingId), "Whiteboard elements retrieved successfully");
    }

    @PostMapping("/{meetingId}")
    @Operation(summary = "Save Whiteboard Elements", description = "Saves whiteboard elements for a specific meeting, overwriting the previous state")
    public ApiResponse<List<WhiteboardElement>> saveWhiteboard(
            @PathVariable String meetingId,
            @RequestBody List<WhiteboardElement> elements) {
        return ApiResponse.success(whiteboardService.saveWhiteboard(meetingId, elements), "Whiteboard elements saved successfully");
    }
}
