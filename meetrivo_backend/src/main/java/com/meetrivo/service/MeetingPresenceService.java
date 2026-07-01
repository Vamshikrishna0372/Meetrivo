package com.meetrivo.service;

import com.meetrivo.model.*;
import com.meetrivo.repository.MeetingParticipantRepository;
import com.meetrivo.repository.MeetingRepository;
import com.meetrivo.websocket.MeetingEvent;
import com.meetrivo.websocket.MeetingEventType;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MeetingPresenceService extends BaseService {

    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository meetingParticipantRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void handleUserJoined(String meetingId, String userId) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found: " + meetingId));

        // Participant record may not exist yet if WebSocket join fires before REST join completes — skip gracefully
        java.util.Optional<MeetingParticipant> participantOpt = meetingParticipantRepository
                .findByMeetingIdAndUserId(meetingId, userId);
        if (participantOpt.isEmpty()) {
            logInfo("Participant record not yet persisted for userId: " + userId + " in meeting: " + meetingId + " — skipping presence broadcast");
            return;
        }
        MeetingParticipant participant = participantOpt.get();

        participant.setOnlineStatus("ONLINE");
        participant.setActive(true);
        participant.setJoinedAt(LocalDateTime.now());
        participant.setLeftAt(null);
        meetingParticipantRepository.save(participant);

        updateAndBroadcastParticipantCount(meetingId);

        MeetingEventType eventType = participant.getRole() == ParticipantRole.HOST ?
                MeetingEventType.HOST_JOINED : MeetingEventType.USER_JOINED;

        broadcastEvent(meetingId, eventType, userId, participant.getUsername(), createPayload(meetingId, participant));
    }

    public void handleUserLeft(String meetingId, String userId) {
        Optional<MeetingParticipant> participantOpt = meetingParticipantRepository
                .findByMeetingIdAndUserId(meetingId, userId);

        if (participantOpt.isPresent()) {
            MeetingParticipant participant = participantOpt.get();
            participant.setOnlineStatus("OFFLINE");
            participant.setActive(false);
            participant.setLeftAt(LocalDateTime.now());
            meetingParticipantRepository.save(participant);

            updateAndBroadcastParticipantCount(meetingId);

            MeetingEventType eventType = participant.getRole() == ParticipantRole.HOST ?
                    MeetingEventType.HOST_LEFT : MeetingEventType.USER_LEFT;

            broadcastEvent(meetingId, eventType, userId, participant.getUsername(), createPayload(meetingId, participant));
        }
    }

    public void handleMuteStateChange(String meetingId, String userId, boolean isMuted) {
        meetingParticipantRepository.findByMeetingIdAndUserId(meetingId, userId).ifPresent(participant -> {
            participant.setMuted(isMuted);
            meetingParticipantRepository.save(participant);

            // Use MIC_ON/MIC_OFF to match frontend useWebSocket.ts event handler
            MeetingEventType eventType = isMuted ? MeetingEventType.MIC_OFF : MeetingEventType.MIC_ON;
            broadcastEvent(meetingId, eventType, userId, participant.getUsername(), createPayload(meetingId, participant));
        });
    }

    public void handleCameraStateChange(String meetingId, String userId, boolean isCameraEnabled) {
        meetingParticipantRepository.findByMeetingIdAndUserId(meetingId, userId).ifPresent(participant -> {
            participant.setCameraEnabled(isCameraEnabled);
            meetingParticipantRepository.save(participant);

            // Use VIDEO_ON/VIDEO_OFF to match frontend useWebSocket.ts event handler
            MeetingEventType eventType = isCameraEnabled ? MeetingEventType.VIDEO_ON : MeetingEventType.VIDEO_OFF;
            broadcastEvent(meetingId, eventType, userId, participant.getUsername(), createPayload(meetingId, participant));
        });
    }

    public void handleScreenShareStateChange(String meetingId, String userId, boolean isScreenSharing) {
        meetingParticipantRepository.findByMeetingIdAndUserId(meetingId, userId).ifPresent(participant -> {
            participant.setScreenSharing(isScreenSharing);
            meetingParticipantRepository.save(participant);

            MeetingEventType eventType = isScreenSharing ? MeetingEventType.SCREEN_SHARE_STARTED : MeetingEventType.SCREEN_SHARE_STOPPED;
            broadcastEvent(meetingId, eventType, userId, participant.getUsername(), createPayload(meetingId, participant));
        });
    }

    public void handleMeetingStarted(String meetingId) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId).orElse(null);
        if (meeting != null) {
            Map<String, Object> payload = Map.of(
                    "status", meeting.getStatus(),
                    "actualStartTime", meeting.getActualStartTime() != null ? meeting.getActualStartTime().toString() : ""
            );
            // Broadcast to /topic/meeting/{meetingId}
            MeetingEvent event = MeetingEvent.builder()
                    .eventType(MeetingEventType.MEETING_STARTED)
                    .meetingId(meetingId)
                    .timestamp(LocalDateTime.now())
                    .payload(payload)
                    .build();
            messagingTemplate.convertAndSend("/topic/meeting/" + meetingId, event);
            logInfo("Meeting started real-time broadcast sent for: " + meetingId);
        }
    }

    public void handleMeetingEnded(String meetingId) {
        Map<String, Object> payload = Map.of(
                "status", MeetingStatus.ENDED,
                "actualEndTime", LocalDateTime.now().toString()
        );
        // Broadcast to /topic/meeting/{meetingId}
        MeetingEvent event = MeetingEvent.builder()
                .eventType(MeetingEventType.MEETING_ENDED)
                .meetingId(meetingId)
                .timestamp(LocalDateTime.now())
                .payload(payload)
                .build();
        messagingTemplate.convertAndSend("/topic/meeting/" + meetingId, event);
        logInfo("Meeting ended real-time broadcast sent for: " + meetingId);
    }

    public void handleUserWaiting(String meetingId, String userId) {
        MeetingParticipant participant = meetingParticipantRepository
                .findByMeetingIdAndUserId(meetingId, userId)
                .orElseThrow(() -> new RuntimeException("Participant record not found"));

        broadcastEvent(meetingId, MeetingEventType.WAITING_ROOM_JOIN, userId, participant.getUsername(), createPayload(meetingId, participant));
    }

    public void handleUserWaitingLeave(String meetingId, String userId, String username) {
        MeetingEvent event = MeetingEvent.builder()
                .eventType(MeetingEventType.WAITING_ROOM_LEAVE)
                .meetingId(meetingId)
                .userId(userId)
                .username(username)
                .timestamp(LocalDateTime.now())
                .payload(Map.of("userId", userId, "username", username))
                .build();

        messagingTemplate.convertAndSend("/topic/participants/" + meetingId, event);
        logInfo("Broadcasted WAITING_ROOM_LEAVE for user: " + username + " in meeting: " + meetingId);
    }

    private void updateAndBroadcastParticipantCount(String meetingId) {
        long activeCount = meetingParticipantRepository.countByMeetingIdAndIsActiveTrue(meetingId);
        meetingRepository.findByMeetingId(meetingId).ifPresent(meeting -> {
            meeting.setParticipantCount((int) activeCount);
            meetingRepository.save(meeting);
        });
    }

    private Map<String, Object> createPayload(String meetingId, MeetingParticipant participant) {
        List<MeetingParticipant> participants = meetingParticipantRepository.findByMeetingIdAndIsActiveTrue(meetingId);
        long activeCount = meetingParticipantRepository.countByMeetingIdAndIsActiveTrue(meetingId);
        return Map.of(
                "participant", participant,
                "currentParticipants", participants,
                "participantCount", activeCount
        );
    }

    private void broadcastEvent(String meetingId, MeetingEventType eventType, String userId, String username, Object payload) {
        MeetingEvent event = MeetingEvent.builder()
                .eventType(eventType)
                .meetingId(meetingId)
                .userId(userId)
                .username(username)
                .timestamp(LocalDateTime.now())
                .payload(payload)
                .build();

        // Media state events go to /topic/meeting/ (handled by frontend useWebSocket media event handler)
        // Participant list events go to /topic/participants/ (handled by participant list handler)
        switch (eventType) {
            case MIC_ON, MIC_OFF, VIDEO_ON, VIDEO_OFF, HAND_RAISED, HAND_LOWERED, CONNECTION_STATE_CHANGED:
                messagingTemplate.convertAndSend("/topic/meeting/" + meetingId, event);
                break;
            default:
                messagingTemplate.convertAndSend("/topic/participants/" + meetingId, event);
                // Also broadcast USER_JOINED/LEFT to /topic/meeting/ so room.tsx gets the event
                if (eventType == MeetingEventType.USER_JOINED || eventType == MeetingEventType.HOST_JOINED
                        || eventType == MeetingEventType.USER_LEFT || eventType == MeetingEventType.HOST_LEFT
                        || eventType == MeetingEventType.MEETING_STARTED || eventType == MeetingEventType.MEETING_ENDED) {
                    messagingTemplate.convertAndSend("/topic/meeting/" + meetingId, event);
                }
                break;
        }
        logInfo("Broadcasted event: " + eventType + " for user: " + username + " in meeting: " + meetingId);
    }
}

