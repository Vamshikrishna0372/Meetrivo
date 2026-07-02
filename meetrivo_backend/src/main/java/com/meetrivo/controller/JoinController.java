package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.dto.JoinMeetingRequest;
import com.meetrivo.dto.ParticipantResponse;
import com.meetrivo.model.MeetingParticipant;
import com.meetrivo.repository.MeetingParticipantRepository;
import com.meetrivo.service.JoinService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
@Tag(name = "Meeting Participation", description = "Endpoints for joining, leaving, and viewing participants of a meeting room")
public class JoinController {

    private final JoinService joinService;
    private final MeetingParticipantRepository meetingParticipantRepository;

    @PostMapping("/join")
    @Operation(summary = "Join Meeting", description = "Allows a user to join an active meeting room by meetingId or meetingCode. Validates password if password-protected.")
    public ApiResponse<ParticipantResponse> joinMeeting(@Valid @RequestBody JoinMeetingRequest request) {
        ParticipantResponse participant = joinService.joinMeeting(request);
        return ApiResponse.success(participant, "Joined meeting successfully");
    }

    @PostMapping("/{meetingId}/leave")
    @Operation(summary = "Leave Meeting", description = "Allows the current user to leave an active meeting room")
    public ApiResponse<String> leaveMeeting(@PathVariable String meetingId) {
        joinService.leaveMeeting(meetingId);
        return ApiResponse.success("Left meeting successfully", "Left meeting successfully");
    }

    @GetMapping("/{meetingId}/participants")
    @Operation(summary = "Get Meeting Participants", description = "Retrieves all active participants of a meeting room")
    public ApiResponse<List<ParticipantResponse>> getParticipants(@PathVariable String meetingId) {
        List<MeetingParticipant> participants = meetingParticipantRepository.findByMeetingIdAndIsActiveTrue(meetingId);
        List<ParticipantResponse> response = participants.stream()
                .map(this::mapToParticipantResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(response, "Meeting participants retrieved successfully");
    }

    @GetMapping("/{meetingId}/waiting-room")
    @Operation(summary = "Get Waiting Room Participants", description = "Retrieves all participants currently in the waiting room")
    public ApiResponse<List<ParticipantResponse>> getWaitingRoomParticipants(@PathVariable String meetingId) {
        List<MeetingParticipant> participants = meetingParticipantRepository.findByMeetingId(meetingId);
        List<ParticipantResponse> response = participants.stream()
                .filter(p -> !p.isApproved() && !p.isBanned())
                .map(this::mapToParticipantResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(response, "Waiting room participants retrieved successfully");
    }




    @PostMapping("/qr/join")
    @Operation(summary = "Join via QR Token", description = "Allows a user to join an active meeting room by scanned secure QR token.")
    public ApiResponse<ParticipantResponse> joinByQrToken(@RequestParam String token) {
        ParticipantResponse participant = joinService.joinByQrToken(token);
        return ApiResponse.success(participant, "Joined meeting via QR successfully");
    }

    private ParticipantResponse mapToParticipantResponse(MeetingParticipant participant) {
        return ParticipantResponse.builder()
                .id(participant.getId())
                .meetingId(participant.getMeetingId())
                .userId(participant.getUserId())
                .username(participant.getUsername())
                .displayName(participant.getDisplayName())
                .role(participant.getRole())
                .joinedAt(participant.getJoinedAt())
                .leftAt(participant.getLeftAt())
                .isMuted(participant.isMuted())
                .isCameraEnabled(participant.isCameraEnabled())
                .isScreenSharing(participant.isScreenSharing())
                .isActive(participant.isActive())
                .isApproved(participant.isApproved())
                .isBanned(participant.isBanned())
                .build();
    }
}
