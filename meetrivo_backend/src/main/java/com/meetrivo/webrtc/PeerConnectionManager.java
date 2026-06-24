package com.meetrivo.webrtc;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class PeerConnectionManager {

    private final WebRTCSessionRepository sessionRepository;

    public WebRTCSession registerPeer(String meetingId, String userId) {
        // If session exists, reactivate it (reconnection)
        Optional<WebRTCSession> existing = sessionRepository.findByMeetingIdAndUserId(meetingId, userId);
        if (existing.isPresent()) {
            WebRTCSession session = existing.get();
            session.setConnectionState(ConnectionStatus.CONNECTED);
            session.setLastActivityAt(LocalDateTime.now());
            return sessionRepository.save(session);
        }

        WebRTCSession session = WebRTCSession.builder()
                .sessionId(UUID.randomUUID().toString())
                .meetingId(meetingId)
                .userId(userId)
                .connectionId(UUID.randomUUID().toString())
                .connectionState(ConnectionStatus.CONNECTING)
                .createdAt(LocalDateTime.now())
                .lastActivityAt(LocalDateTime.now())
                .build();

        return sessionRepository.save(session);
    }

    public void removePeer(String meetingId, String userId) {
        sessionRepository.findByMeetingIdAndUserId(meetingId, userId).ifPresent(session -> {
            session.setConnectionState(ConnectionStatus.DISCONNECTED);
            session.setLastActivityAt(LocalDateTime.now());
            sessionRepository.save(session);
        });
    }

    public void updateConnectionState(String meetingId, String userId, ConnectionStatus state) {
        sessionRepository.findByMeetingIdAndUserId(meetingId, userId).ifPresent(session -> {
            session.setConnectionState(state);
            session.setLastActivityAt(LocalDateTime.now());
            sessionRepository.save(session);
        });
    }

    public void refreshActivity(String meetingId, String userId) {
        sessionRepository.findByMeetingIdAndUserId(meetingId, userId).ifPresent(session -> {
            session.setLastActivityAt(LocalDateTime.now());
            sessionRepository.save(session);
        });
    }

    public List<WebRTCSession> getActiveConnections(String meetingId) {
        return sessionRepository.findByMeetingId(meetingId).stream()
                .filter(s -> s.getConnectionState() == ConnectionStatus.CONNECTED ||
                             s.getConnectionState() == ConnectionStatus.CONNECTING ||
                             s.getConnectionState() == ConnectionStatus.RECONNECTING)
                .toList();
    }

    public Optional<WebRTCSession> getSession(String meetingId, String userId) {
        return sessionRepository.findByMeetingIdAndUserId(meetingId, userId);
    }

    // Scheduled cleanup: mark sessions inactive for more than 2 minutes as FAILED
    @Scheduled(fixedDelay = 60000)
    public void cleanupInactiveSessions() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(2);
        List<WebRTCSession> stale = sessionRepository.findByLastActivityAtBefore(cutoff);
        stale.stream()
                .filter(s -> s.getConnectionState() != ConnectionStatus.DISCONNECTED &&
                             s.getConnectionState() != ConnectionStatus.FAILED)
                .forEach(session -> {
                    session.setConnectionState(ConnectionStatus.FAILED);
                    sessionRepository.save(session);
                });
    }
}
