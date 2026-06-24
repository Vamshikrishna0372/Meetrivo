package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.model.BreakoutRoom;
import com.meetrivo.repository.BreakoutRoomRepository;
import com.meetrivo.service.BreakoutRoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/breakout-rooms")
@RequiredArgsConstructor
@Tag(name = "Breakout Room Management", description = "Endpoints for managing breakout rooms during a video conference")
public class BreakoutRoomController {

    private final BreakoutRoomService breakoutRoomService;
    private final BreakoutRoomRepository breakoutRoomRepository;

    @PostMapping("/{meetingId}")
    @Operation(summary = "Create Breakout Room", description = "Creates a new breakout room for a meeting")
    public ApiResponse<BreakoutRoom> createRoom(
            @PathVariable String meetingId,
            @RequestBody Map<String, String> body) {
        String roomName = body.get("roomName");
        if (roomName == null || roomName.trim().isEmpty()) {
            throw new RuntimeException("roomName is required");
        }
        return ApiResponse.success(breakoutRoomService.createRoom(meetingId, roomName), "Breakout room created successfully");
    }

    @GetMapping("/{meetingId}")
    @Operation(summary = "Get Breakout Rooms", description = "Retrieves all breakout rooms for a specific meeting")
    public ApiResponse<List<BreakoutRoom>> getRooms(@PathVariable String meetingId) {
        return ApiResponse.success(breakoutRoomService.getRooms(meetingId), "Breakout rooms retrieved successfully");
    }

    @PostMapping("/{roomId}/end")
    @Operation(summary = "End Breakout Room", description = "Closes a breakout room by room ID")
    public ApiResponse<BreakoutRoom> endRoom(@PathVariable String roomId) {
        BreakoutRoom room = breakoutRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Breakout room not found with ID: " + roomId));
        return ApiResponse.success(breakoutRoomService.closeRoom(room.getMeetingId(), roomId), "Breakout room ended successfully");
    }

    @PostMapping("/{meetingId}/{roomId}/assign")
    @Operation(summary = "Assign Participants", description = "Assigns a list of participants to a breakout room")
    public ApiResponse<BreakoutRoom> assignParticipants(
            @PathVariable String meetingId,
            @PathVariable String roomId,
            @RequestBody Map<String, List<String>> body) {
        List<String> participantIds = body.get("participantIds");
        if (participantIds == null) {
            throw new RuntimeException("participantIds list is required");
        }
        return ApiResponse.success(breakoutRoomService.assignParticipants(meetingId, roomId, participantIds), "Participants assigned successfully");
    }

    @PostMapping("/{meetingId}/move")
    @Operation(summary = "Move Participant", description = "Moves a participant from one breakout room to another")
    public ApiResponse<BreakoutRoom> moveParticipant(
            @PathVariable String meetingId,
            @RequestBody Map<String, String> body) {
        String fromRoomId = body.get("fromRoomId");
        String toRoomId = body.get("toRoomId");
        String participantId = body.get("participantId");
        if (fromRoomId == null || toRoomId == null || participantId == null) {
            throw new RuntimeException("fromRoomId, toRoomId, and participantId are required");
        }
        return ApiResponse.success(breakoutRoomService.moveParticipant(meetingId, fromRoomId, toRoomId, participantId), "Participant moved successfully");
    }
}
