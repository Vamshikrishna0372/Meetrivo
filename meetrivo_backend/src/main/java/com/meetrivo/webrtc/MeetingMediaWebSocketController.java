package com.meetrivo.webrtc;

import com.meetrivo.model.User;
import io.swagger.v3.oas.annotations.Operation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class MeetingMediaWebSocketController {

    private final WebRTCService webrtcService;

    /**
     * Client sends: /app/meeting/{meetingId}/media/join
     * Initialises WebRTC session and media state for the joining user.
     */
    @MessageMapping("/meeting/{meetingId}/media/join")
    public void initMediaSession(@DestinationVariable String meetingId, Principal principal) {
        if (principal == null) return;
        User user = resolve(principal);
        webrtcService.initSession(meetingId, user.getId());
    }

    /**
     * Client sends: /app/meeting/{meetingId}/media/leave
     * Tears down WebRTC session and clears screen share.
     */
    @MessageMapping("/meeting/{meetingId}/media/leave")
    public void endMediaSession(@DestinationVariable String meetingId, Principal principal) {
        if (principal == null) return;
        User user = resolve(principal);
        webrtcService.endSession(meetingId, user.getId());
    }

    /**
     * Client sends: /app/meeting/{meetingId}/media/reconnect
     * Handles temporary disconnect and recovery.
     */
    @MessageMapping("/meeting/{meetingId}/media/reconnect")
    public void reconnect(@DestinationVariable String meetingId, Principal principal) {
        if (principal == null) return;
        User user = resolve(principal);
        webrtcService.handleReconnect(meetingId, user.getId());
    }

    /**
     * Client sends: /app/meeting/{meetingId}/media/video
     * Payload: { "enabled": true/false }
     * Broadcasts VIDEO_ON or VIDEO_OFF to /topic/meeting/{meetingId}.
     */
    @MessageMapping("/meeting/{meetingId}/media/video")
    public void updateVideoState(
            @DestinationVariable String meetingId,
            @Payload MediaToggleRequest request,
            Principal principal) {
        if (principal == null) return;
        User user = resolve(principal);
        webrtcService.updateVideoState(meetingId, user.getId(), request.isEnabled());
    }

    /**
     * Client sends: /app/meeting/{meetingId}/media/audio
     * Payload: { "enabled": true/false }
     * Broadcasts MIC_ON or MIC_OFF to /topic/meeting/{meetingId}.
     */
    @MessageMapping("/meeting/{meetingId}/media/audio")
    public void updateAudioState(
            @DestinationVariable String meetingId,
            @Payload MediaToggleRequest request,
            Principal principal) {
        if (principal == null) return;
        User user = resolve(principal);
        webrtcService.updateAudioState(meetingId, user.getId(), request.isEnabled());
    }

    /**
     * Client sends: /app/meeting/{meetingId}/media/screenshare
     * Payload: { "enabled": true/false }
     * Broadcasts SCREEN_SHARE_STARTED or SCREEN_SHARE_STOPPED.
     */
    @MessageMapping("/meeting/{meetingId}/media/screenshare")
    public void updateScreenShare(
            @DestinationVariable String meetingId,
            @Payload MediaToggleRequest request,
            Principal principal) {
        if (principal == null) return;
        User user = resolve(principal);
        webrtcService.updateScreenShareState(meetingId, user.getId(), request.isEnabled());
    }

    /**
     * Client sends: /app/meeting/{meetingId}/media/hand
     * Payload: { "enabled": true/false }
     * Broadcasts HAND_RAISED or HAND_LOWERED.
     */
    @MessageMapping("/meeting/{meetingId}/media/hand")
    public void updateHandRaise(
            @DestinationVariable String meetingId,
            @Payload MediaToggleRequest request,
            Principal principal) {
        if (principal == null) return;
        User user = resolve(principal);
        webrtcService.updateHandRaised(meetingId, user.getId(), request.isEnabled());
    }

    /**
     * Client sends: /app/meeting/{meetingId}/media/connection-state
     * Payload: { "state": "CONNECTED" }
     * Updates connection state in database and broadcasts to meeting topic.
     */
    @MessageMapping("/meeting/{meetingId}/media/connection-state")
    public void updateConnectionState(
            @DestinationVariable String meetingId,
            @Payload ConnectionStateRequest request,
            Principal principal) {
        if (principal == null) return;
        User user = resolve(principal);
        try {
            ConnectionStatus status = ConnectionStatus.valueOf(request.getState());
            webrtcService.updateConnectionState(meetingId, user.getId(), status);
        } catch (IllegalArgumentException ignored) {
            // Invalid state value — ignore silently
        }
    }

    private User resolve(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken token) {
            return (User) token.getPrincipal();
        }
        throw new RuntimeException("Invalid principal type");
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MediaToggleRequest {
        private boolean enabled;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConnectionStateRequest {
        private String state;
    }
}
