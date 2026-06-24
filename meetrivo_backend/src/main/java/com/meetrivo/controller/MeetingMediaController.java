package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.model.Meeting;
import com.meetrivo.model.User;
import com.meetrivo.repository.MeetingParticipantRepository;
import com.meetrivo.repository.MeetingRepository;
import com.meetrivo.webrtc.ParticipantMediaState;
import com.meetrivo.webrtc.ParticipantMediaStateRepository;
import com.meetrivo.webrtc.WebRTCService;
import com.meetrivo.webrtc.ParticipantMediaEvent;
import com.meetrivo.service.JoinService;
import com.meetrivo.service.MeetingPresenceService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meetings/{meetingId}")
@RequiredArgsConstructor
@Tag(name = "Meeting Media Controls", description = "Endpoints for handling real-time audio, video, and host media controls")
public class MeetingMediaController {

    private final WebRTCService webrtcService;
    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository meetingParticipantRepository;
    private final ParticipantMediaStateRepository mediaStateRepository;
    private final JoinService joinService;
    private final MeetingPresenceService presenceService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/mute")
    @Operation(summary = "Mute User", description = "Allows the host to mute a specific user's microphone")
    public ApiResponse<String> muteUser(@PathVariable String meetingId, @RequestParam String userId) {
        validateHost(meetingId);
        webrtcService.updateAudioState(meetingId, userId, false);
        return ApiResponse.success("User muted successfully", "User muted successfully");
    }

    @PostMapping("/unmute")
    @Operation(summary = "Unmute User", description = "Allows the host to unmute a specific user's microphone")
    public ApiResponse<String> unmuteUser(@PathVariable String meetingId, @RequestParam String userId) {
        validateHost(meetingId);
        webrtcService.updateAudioState(meetingId, userId, true);
        return ApiResponse.success("User unmuted successfully", "User unmuted successfully");
    }

    @PostMapping("/video-on")
    @Operation(summary = "Allow User Video", description = "Allows the host to request enabling a user's camera")
    public ApiResponse<String> enableVideo(@PathVariable String meetingId, @RequestParam String userId) {
        validateHost(meetingId);
        webrtcService.updateVideoState(meetingId, userId, true);
        return ApiResponse.success("User camera enabled successfully", "User camera enabled successfully");
    }

    @PostMapping("/video-off")
    @Operation(summary = "Disable User Video", description = "Allows the host to disable a user's camera")
    public ApiResponse<String> disableVideo(@PathVariable String meetingId, @RequestParam String userId) {
        validateHost(meetingId);
        webrtcService.updateVideoState(meetingId, userId, false);
        return ApiResponse.success("User camera disabled successfully", "User camera disabled successfully");
    }

    @PostMapping("/remove")
    @Operation(summary = "Remove Participant", description = "Allows the host to remove a specific participant from the meeting room")
    public ApiResponse<String> removeParticipant(@PathVariable String meetingId, @RequestParam String userId) {
        validateHost(meetingId);
        joinService.removeParticipant(meetingId, userId);
        presenceService.handleUserLeft(meetingId, userId);
        webrtcService.endSession(meetingId, userId);

        // Broadcast user removed event to meeting topic
        messagingTemplate.convertAndSend("/topic/meeting/" + meetingId,
                ParticipantMediaEvent.builder()
                        .eventType("USER_REMOVED")
                        .meetingId(meetingId)
                        .userId(userId)
                        .timestamp(LocalDateTime.now())
                        .payload(Map.of("userId", userId))
                        .build()
        );

        return ApiResponse.success("Participant removed successfully", "Participant removed successfully");
    }

    @PostMapping("/lower-hand")
    @Operation(summary = "Lower Participant Hand", description = "Allows the host to lower a specific participant's raised hand")
    public ApiResponse<String> lowerHand(@PathVariable String meetingId, @RequestParam String userId) {
        validateHost(meetingId);
        webrtcService.updateHandRaised(meetingId, userId, false);

        // Broadcast HAND_LOWERED event to chat topic
        var event = Map.of(
                "eventType", "HAND_LOWERED",
                "meetingId", meetingId,
                "userId", userId,
                "timestamp", LocalDateTime.now().toString()
        );
        messagingTemplate.convertAndSend("/topic/chat/" + meetingId, event);

        return ApiResponse.success("Hand lowered successfully", "Hand lowered successfully");
    }

    @GetMapping("/media-state")
    @Operation(summary = "Get Meeting Media States", description = "Retrieves the current media state of all participants in the meeting room")
    public ApiResponse<List<ParticipantMediaState>> getMediaState(@PathVariable String meetingId) {
        validateMember(meetingId);
        List<ParticipantMediaState> states = mediaStateRepository.findByMeetingId(meetingId);
        return ApiResponse.success(states, "Meeting media states retrieved successfully");
    }

    private void validateHost(String meetingId) {
        User currentUser = getCurrentUser();
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));
        if (!meeting.getHostId().equals(currentUser.getId())) {
            throw new RuntimeException("Only the host can perform this action");
        }
    }

    private void validateMember(String meetingId) {
        User currentUser = getCurrentUser();
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));
        boolean isHost = meeting.getHostId().equals(currentUser.getId());
        boolean isParticipant = meetingParticipantRepository.existsByMeetingIdAndUserId(meetingId, currentUser.getId());
        if (!isHost && !isParticipant) {
            throw new RuntimeException("Access denied: You are not a member of this meeting");
        }
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
