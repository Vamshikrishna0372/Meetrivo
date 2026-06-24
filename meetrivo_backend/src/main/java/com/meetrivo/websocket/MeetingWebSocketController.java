package com.meetrivo.websocket;

import com.meetrivo.model.User;
import com.meetrivo.service.MeetingPresenceService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class MeetingWebSocketController {

    private final MeetingPresenceService presenceService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/meeting/{meetingId}/join")
    public void joinMeeting(@DestinationVariable String meetingId, Principal principal) {
        if (principal == null) return;
        User user = getUserFromPrincipal(principal);
        presenceService.handleUserJoined(meetingId, user.getId());
    }

    @MessageMapping("/meeting/{meetingId}/leave")
    public void leaveMeeting(@DestinationVariable String meetingId, Principal principal) {
        if (principal == null) return;
        User user = getUserFromPrincipal(principal);
        presenceService.handleUserLeft(meetingId, user.getId());
    }

    @MessageMapping("/meeting/{meetingId}/state")
    public void updateParticipantState(
            @DestinationVariable String meetingId,
            @Payload StateUpdateRequest updateRequest,
            Principal principal) {
        if (principal == null) return;
        User user = getUserFromPrincipal(principal);

        if (updateRequest.getIsMuted() != null) {
            presenceService.handleMuteStateChange(meetingId, user.getId(), updateRequest.getIsMuted());
        }
        if (updateRequest.getIsCameraEnabled() != null) {
            presenceService.handleCameraStateChange(meetingId, user.getId(), updateRequest.getIsCameraEnabled());
        }
        if (updateRequest.getIsScreenSharing() != null) {
            presenceService.handleScreenShareStateChange(meetingId, user.getId(), updateRequest.getIsScreenSharing());
        }
    }

    @MessageMapping("/meeting/{meetingId}/signaling")
    public void routeSignalingMessage(
            @DestinationVariable String meetingId,
            @Payload SignalingMessage message,
            Principal principal) {
        if (principal == null) return;
        User user = getUserFromPrincipal(principal);

        // Ensure the senderId is set to the authenticated user's ID
        message.setSenderId(user.getId());
        message.setMeetingId(meetingId);

        // Broadcast to the target meeting signaling topic
        messagingTemplate.convertAndSend("/topic/signaling/" + meetingId, message);
    }

    private User getUserFromPrincipal(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken) {
            return (User) ((UsernamePasswordAuthenticationToken) principal).getPrincipal();
        }
        throw new RuntimeException("Invalid principal type");
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StateUpdateRequest {
        private Boolean isMuted;
        private Boolean isCameraEnabled;
        private Boolean isScreenSharing;
    }
}
