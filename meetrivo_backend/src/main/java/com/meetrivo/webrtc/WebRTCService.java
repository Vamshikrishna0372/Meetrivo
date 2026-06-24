package com.meetrivo.webrtc;

import com.meetrivo.repository.MeetingParticipantRepository;
import com.meetrivo.service.BaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WebRTCService extends BaseService {

    private final WebRTCSessionRepository sessionRepository;
    private final ParticipantMediaStateRepository mediaStateRepository;
    private final ScreenShareStateRepository screenShareStateRepository;
    private final PeerConnectionManager peerConnectionManager;
    private final SimpMessagingTemplate messagingTemplate;
    private final MeetingParticipantRepository meetingParticipantRepository;

    // ─── Session Management ──────────────────────────────────────────────────

    public WebRTCSession initSession(String meetingId, String userId) {
        WebRTCSession session = peerConnectionManager.registerPeer(meetingId, userId);
        session.setConnectionState(ConnectionStatus.CONNECTED);
        WebRTCSession saved = sessionRepository.save(session);

        // Ensure media state record exists
        mediaStateRepository.findByMeetingIdAndUserId(meetingId, userId).orElseGet(() -> {
            ParticipantMediaState state = ParticipantMediaState.builder()
                    .meetingId(meetingId)
                    .userId(userId)
                    .videoEnabled(true)
                    .audioEnabled(true)
                    .screenSharing(false)
                    .handRaised(false)
                    .speakerActive(false)
                    .build();
            return mediaStateRepository.save(state);
        });

        broadcastMediaEvent(meetingId, userId, "SESSION_STARTED", Map.of(
                "connectionState", ConnectionStatus.CONNECTED,
                "sessionId", saved.getSessionId()
        ));
        logInfo("WebRTC session initiated for user: " + userId + " in meeting: " + meetingId);
        return saved;
    }

    public void handleReconnect(String meetingId, String userId) {
        peerConnectionManager.updateConnectionState(meetingId, userId, ConnectionStatus.RECONNECTING);
        broadcastMediaEvent(meetingId, userId, "SESSION_RECONNECTING", Map.of("userId", userId));

        // Re-register and mark connected
        peerConnectionManager.registerPeer(meetingId, userId);
        peerConnectionManager.updateConnectionState(meetingId, userId, ConnectionStatus.CONNECTED);
        broadcastMediaEvent(meetingId, userId, "SESSION_RECONNECTED", Map.of("userId", userId));
        logInfo("User reconnected: " + userId + " in meeting: " + meetingId);
    }

    public void endSession(String meetingId, String userId) {
        peerConnectionManager.removePeer(meetingId, userId);
        // Clean up screen share if active
        screenShareStateRepository.findByMeetingIdAndUserId(meetingId, userId).ifPresent(ss -> {
            ss.setActive(false);
            screenShareStateRepository.save(ss);
        });
        broadcastMediaEvent(meetingId, userId, "SESSION_ENDED", Map.of("userId", userId));
        logInfo("WebRTC session ended for user: " + userId + " in meeting: " + meetingId);
    }

    // ─── Video Control ───────────────────────────────────────────────────────

    public void updateVideoState(String meetingId, String userId, boolean videoEnabled) {
        mediaStateRepository.findByMeetingIdAndUserId(meetingId, userId).ifPresent(state -> {
            state.setVideoEnabled(videoEnabled);
            mediaStateRepository.save(state);
        });
        meetingParticipantRepository.findByMeetingIdAndUserId(meetingId, userId).ifPresent(participant -> {
            participant.setCameraEnabled(videoEnabled);
            meetingParticipantRepository.save(participant);
        });
        peerConnectionManager.refreshActivity(meetingId, userId);
        String eventType = videoEnabled ? "VIDEO_ON" : "VIDEO_OFF";
        broadcastMediaEvent(meetingId, userId, eventType, Map.of(
                "videoEnabled", videoEnabled,
                "userId", userId
        ));
        logInfo("Video state changed for user: " + userId + " in meeting: " + meetingId + " -> " + eventType);
    }

    // ─── Audio Control ───────────────────────────────────────────────────────

    public void updateAudioState(String meetingId, String userId, boolean audioEnabled) {
        mediaStateRepository.findByMeetingIdAndUserId(meetingId, userId).ifPresent(state -> {
            state.setAudioEnabled(audioEnabled);
            mediaStateRepository.save(state);
        });
        meetingParticipantRepository.findByMeetingIdAndUserId(meetingId, userId).ifPresent(participant -> {
            participant.setMuted(!audioEnabled);
            meetingParticipantRepository.save(participant);
        });
        peerConnectionManager.refreshActivity(meetingId, userId);
        String eventType = audioEnabled ? "MIC_ON" : "MIC_OFF";
        broadcastMediaEvent(meetingId, userId, eventType, Map.of(
                "audioEnabled", audioEnabled,
                "userId", userId
        ));

        // Broadcast USER_MUTED or USER_UNMUTED to chat and meeting topics
        String userEvent = audioEnabled ? "USER_UNMUTED" : "USER_MUTED";
        var chatEvent = java.util.Map.of(
                "eventType", userEvent,
                "meetingId", meetingId,
                "userId", userId,
                "timestamp", java.time.LocalDateTime.now().toString()
        );
        messagingTemplate.convertAndSend("/topic/chat/" + meetingId, chatEvent);
        messagingTemplate.convertAndSend("/topic/meeting/" + meetingId, chatEvent);

        logInfo("Audio state changed for user: " + userId + " in meeting: " + meetingId + " -> " + eventType);
    }

    // ─── Screen Share Control ────────────────────────────────────────────────

    public void updateScreenShareState(String meetingId, String userId, boolean active) {
        // Update media state
        mediaStateRepository.findByMeetingIdAndUserId(meetingId, userId).ifPresent(state -> {
            state.setScreenSharing(active);
            mediaStateRepository.save(state);
        });

        // Persist dedicated screen share record
        ScreenShareState screenShare = screenShareStateRepository
                .findByMeetingIdAndUserId(meetingId, userId)
                .orElse(ScreenShareState.builder().meetingId(meetingId).userId(userId).build());
        screenShare.setActive(active);
        screenShare.setStartedAt(active ? LocalDateTime.now() : null);
        screenShareStateRepository.save(screenShare);

        peerConnectionManager.refreshActivity(meetingId, userId);
        String eventType = active ? "SCREEN_SHARE_STARTED" : "SCREEN_SHARE_STOPPED";
        broadcastMediaEvent(meetingId, userId, eventType, Map.of(
                "screenSharing", active,
                "userId", userId
        ));
        logInfo("Screen share state changed for user: " + userId + " in meeting: " + meetingId + " -> " + eventType);
    }

    // ─── Hand Raise ──────────────────────────────────────────────────────────

    public void updateHandRaised(String meetingId, String userId, boolean handRaised) {
        mediaStateRepository.findByMeetingIdAndUserId(meetingId, userId).ifPresent(state -> {
            state.setHandRaised(handRaised);
            mediaStateRepository.save(state);
        });
        broadcastMediaEvent(meetingId, userId, handRaised ? "HAND_RAISED" : "HAND_LOWERED", Map.of(
                "handRaised", handRaised,
                "userId", userId
        ));
    }

    // ─── Connection State ────────────────────────────────────────────────────

    public void updateConnectionState(String meetingId, String userId, ConnectionStatus status) {
        peerConnectionManager.updateConnectionState(meetingId, userId, status);
        broadcastMediaEvent(meetingId, userId, "CONNECTION_STATE_CHANGED", Map.of(
                "connectionState", status,
                "userId", userId
        ));
    }

    // ─── Queries ─────────────────────────────────────────────────────────────

    public List<ParticipantMediaState> getAllMediaStates(String meetingId) {
        return mediaStateRepository.findByMeetingId(meetingId);
    }

    public List<WebRTCSession> getActiveConnections(String meetingId) {
        return peerConnectionManager.getActiveConnections(meetingId);
    }

    // ─── Broadcast ───────────────────────────────────────────────────────────

    private void broadcastMediaEvent(String meetingId, String userId, String eventType, Object payload) {
        ParticipantMediaEvent event = ParticipantMediaEvent.builder()
                .eventType(eventType)
                .meetingId(meetingId)
                .userId(userId)
                .timestamp(LocalDateTime.now())
                .payload(payload)
                .build();
        messagingTemplate.convertAndSend("/topic/meeting/" + meetingId, event);
    }
}
