package com.meetrivo.service;

import com.meetrivo.model.*;
import com.meetrivo.repository.MeetingParticipantRepository;
import com.meetrivo.repository.MeetingRepository;
import com.meetrivo.repository.PresentationHistoryRepository;
import com.meetrivo.repository.ScreenShareSessionRepository;
import com.meetrivo.webrtc.WebRTCService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ScreenShareService extends BaseService {

    private final ScreenShareSessionRepository sessionRepository;
    private final PresentationHistoryRepository historyRepository;
    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository participantRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final WebRTCService webrtcService;

    // ─── Share Actions ────────────────────────────────────────────────────────

    public ScreenShareSession startShare(String meetingId, String sessionId, ShareType shareType) {
        User user = getCurrentUser();
        validateMembership(meetingId, user.getId());
        validateSharePermission(meetingId, user.getId());

        // Stop any existing active sessions (presenter transfer / switch)
        stopActiveShareInternal(meetingId);

        ScreenShareSession session = ScreenShareSession.builder()
                .meetingId(meetingId)
                .userId(user.getId())
                .sessionId(sessionId)
                .shareType(shareType)
                .status(ShareStatus.STARTED)
                .startedAt(LocalDateTime.now())
                .build();

        ScreenShareSession saved = sessionRepository.save(session);

        // Record in presentation history
        PresentationHistory history = PresentationHistory.builder()
                .meetingId(meetingId)
                .presenterId(user.getId())
                .presenterName(user.getFullName() != null ? user.getFullName() : user.getUsername())
                .active(true)
                .startTime(LocalDateTime.now())
                .build();
        historyRepository.save(history);

        // Update WebRTC ScreenShareState
        try {
            webrtcService.updateScreenShareState(meetingId, user.getId(), true);
        } catch (Exception e) {
            logError("Failed to update WebRTC screen share state on start", e);
        }

        // Broadcast events
        broadcastShareEvent(meetingId, "SCREEN_SHARE_STARTED", Map.<String, Object>of(
                "sessionId", sessionId,
                "userId", user.getId(),
                "shareType", shareType.name()
        ));
        broadcastPresenterEvent(meetingId, "PRESENTER_CHANGED", Map.<String, Object>of(
                "presenterId", user.getId(),
                "presenterName", history.getPresenterName(),
                "active", true
        ));

        logInfo("Screen sharing started by user: " + user.getUsername() + " in meeting: " + meetingId);
        return saved;
    }

    public ScreenShareSession stopShare(String meetingId, String userId) {
        User caller = getCurrentUser();
        validateMembership(meetingId, caller.getId());

        boolean isHost = isHost(meetingId, caller.getId());
        if (!caller.getId().equals(userId) && !isHost) {
            throw new RuntimeException("Unauthorized: Only the presenter or host can stop the screen share");
        }

        Optional<ScreenShareSession> activeSessionOpt =
                sessionRepository.findByMeetingIdAndUserIdAndStatus(meetingId, userId, ShareStatus.STARTED)
                        .or(() -> sessionRepository.findByMeetingIdAndUserIdAndStatus(meetingId, userId, ShareStatus.PAUSED));

        if (activeSessionOpt.isPresent()) {
            ScreenShareSession session = activeSessionOpt.get();
            session.setStatus(ShareStatus.STOPPED);
            session.setEndedAt(LocalDateTime.now());
            sessionRepository.save(session);

            // Update presentation history
            historyRepository.findByMeetingIdAndActive(meetingId, true).ifPresent(history -> {
                if (history.getPresenterId().equals(userId)) {
                    history.setActive(false);
                    history.setEndTime(LocalDateTime.now());
                    historyRepository.save(history);
                }
            });

            // Update WebRTC ScreenShareState
            try {
                webrtcService.updateScreenShareState(meetingId, userId, false);
            } catch (Exception e) {
                logError("Failed to update WebRTC screen share state on stop", e);
            }

            broadcastShareEvent(meetingId, "SCREEN_SHARE_STOPPED", Map.<String, Object>of("userId", userId));
            broadcastPresenterEvent(meetingId, "PRESENTER_CHANGED", Map.<String, Object>of("active", false));

            logInfo("Screen sharing stopped for user: " + userId + " in meeting: " + meetingId);
            return session;
        }

        return null;
    }

    public ScreenShareSession pauseShare(String meetingId) {
        User user = getCurrentUser();
        validateMembership(meetingId, user.getId());

        Optional<ScreenShareSession> activeSession =
                sessionRepository.findByMeetingIdAndUserIdAndStatus(meetingId, user.getId(), ShareStatus.STARTED);

        if (activeSession.isPresent()) {
            ScreenShareSession session = activeSession.get();
            session.setStatus(ShareStatus.PAUSED);
            sessionRepository.save(session);

            broadcastShareEvent(meetingId, "SCREEN_SHARE_PAUSED", Map.<String, Object>of("userId", user.getId()));
            logInfo("Screen sharing paused by user: " + user.getUsername() + " in meeting: " + meetingId);
            return session;
        }
        throw new RuntimeException("No active screen share session to pause");
    }

    public ScreenShareSession resumeShare(String meetingId) {
        User user = getCurrentUser();
        validateMembership(meetingId, user.getId());

        Optional<ScreenShareSession> pausedSession =
                sessionRepository.findByMeetingIdAndUserIdAndStatus(meetingId, user.getId(), ShareStatus.PAUSED);

        if (pausedSession.isPresent()) {
            ScreenShareSession session = pausedSession.get();
            session.setStatus(ShareStatus.STARTED);
            sessionRepository.save(session);

            broadcastShareEvent(meetingId, "SCREEN_SHARE_RESUMED", Map.<String, Object>of("userId", user.getId()));
            logInfo("Screen sharing resumed by user: " + user.getUsername() + " in meeting: " + meetingId);
            return session;
        }
        throw new RuntimeException("No paused screen share session to resume");
    }

    // ─── Presenter Management ─────────────────────────────────────────────────

    public Optional<PresentationHistory> getCurrentPresenter(String meetingId) {
        return historyRepository.findByMeetingIdAndActive(meetingId, true);
    }

    public void transferPresenter(String meetingId, String targetUserId) {
        User host = getCurrentUser();
        validateMembership(meetingId, host.getId());
        if (!isHost(meetingId, host.getId())) {
            throw new RuntimeException("Only the host can transfer the presenter role");
        }

        MeetingParticipant targetParticipant = participantRepository
                .findByMeetingIdAndUserId(meetingId, targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user is not a participant in this meeting"));

        // End current active presentation
        stopActiveShareInternal(meetingId);

        String presenterName = targetParticipant.getDisplayName() != null
                ? targetParticipant.getDisplayName()
                : targetParticipant.getUsername();

        PresentationHistory history = PresentationHistory.builder()
                .meetingId(meetingId)
                .presenterId(targetUserId)
                .presenterName(presenterName)
                .active(true)
                .startTime(LocalDateTime.now())
                .build();
        historyRepository.save(history);

        broadcastPresenterEvent(meetingId, "PRESENTER_CHANGED", Map.<String, Object>of(
                "presenterId", targetUserId,
                "presenterName", presenterName,
                "active", true
        ));

        logInfo("Presenter role transferred to: " + targetUserId + " in meeting: " + meetingId);
    }

    public void removePresenter(String meetingId) {
        User host = getCurrentUser();
        validateMembership(meetingId, host.getId());
        if (!isHost(meetingId, host.getId())) {
            throw new RuntimeException("Only the host can remove the presenter");
        }
        stopActiveShareInternal(meetingId);
        logInfo("Presenter removed in meeting: " + meetingId);
    }

    // ─── Host Controls ────────────────────────────────────────────────────────

    public void startPresentation(String meetingId) {
        User host = getCurrentUser();
        validateMembership(meetingId, host.getId());
        if (!isHost(meetingId, host.getId())) {
            throw new RuntimeException("Only the host can start a presentation");
        }
        broadcastPresenterEvent(meetingId, "PRESENTATION_STARTED", Map.<String, Object>of(
                "startedBy", host.getId(),
                "timestamp", LocalDateTime.now().toString()
        ));
        logInfo("Presentation started by host: " + host.getUsername() + " in meeting: " + meetingId);
    }

    public void stopPresentation(String meetingId) {
        User host = getCurrentUser();
        validateMembership(meetingId, host.getId());
        if (!isHost(meetingId, host.getId())) {
            throw new RuntimeException("Only the host can stop a presentation");
        }
        stopActiveShareInternal(meetingId);
        logInfo("Presentation stopped by host: " + host.getUsername() + " in meeting: " + meetingId);
    }

    public void disableSharing(String meetingId) {
        User host = getCurrentUser();
        validateMembership(meetingId, host.getId());
        if (!isHost(meetingId, host.getId())) {
            throw new RuntimeException("Only the host can disable screen sharing");
        }
        meetingRepository.findByMeetingId(meetingId).ifPresent(m -> {
            m.setScreenShareEnabled(false);
            meetingRepository.save(m);
        });
        stopActiveShareInternal(meetingId);
        broadcastShareEvent(meetingId, "SHARING_DISABLED", Map.<String, Object>of("disabledBy", host.getId()));
        logInfo("Screen sharing disabled in meeting: " + meetingId);
    }

    public void enableSharing(String meetingId) {
        User host = getCurrentUser();
        validateMembership(meetingId, host.getId());
        if (!isHost(meetingId, host.getId())) {
            throw new RuntimeException("Only the host can enable screen sharing");
        }
        meetingRepository.findByMeetingId(meetingId).ifPresent(m -> {
            m.setScreenShareEnabled(true);
            meetingRepository.save(m);
        });
        broadcastShareEvent(meetingId, "SHARING_ENABLED", Map.<String, Object>of("enabledBy", host.getId()));
        logInfo("Screen sharing enabled in meeting: " + meetingId);
    }

    public void updateSharePermission(String meetingId, SharePermission permission) {
        User host = getCurrentUser();
        validateMembership(meetingId, host.getId());
        if (!isHost(meetingId, host.getId())) {
            throw new RuntimeException("Only the host can update sharing permissions");
        }
        meetingRepository.findByMeetingId(meetingId).ifPresent(m -> {
            m.setSharePermission(permission);
            meetingRepository.save(m);
        });
        broadcastShareEvent(meetingId, "SHARE_PERMISSIONS_UPDATED", Map.<String, Object>of(
                "permission", permission.name(),
                "updatedBy", host.getId()
        ));
        logInfo("Share permissions updated to: " + permission + " in meeting: " + meetingId);
    }

    // ─── Remote Control Foundation ─────────────────────────────────────────────

    public void requestRemoteControl(String meetingId, String targetUserId) {
        User requester = getCurrentUser();
        validateMembership(meetingId, requester.getId());
        validateMembership(meetingId, targetUserId);

        String requesterName = requester.getFullName() != null ? requester.getFullName() : requester.getUsername();
        Map<String, Object> event = Map.of(
                "eventType", "REMOTE_CONTROL_REQUESTED",
                "requesterId", requester.getId(),
                "requesterName", requesterName,
                "targetUserId", targetUserId,
                "timestamp", LocalDateTime.now().toString()
        );

        messagingTemplate.convertAndSend("/topic/private/" + targetUserId, (Object) event);
        messagingTemplate.convertAndSend("/topic/screenshare/" + meetingId, (Object) event);
        logInfo("User " + requester.getUsername() + " requested remote control from user: " + targetUserId);
    }

    public void grantRemoteControl(String meetingId, String requesterId) {
        User granter = getCurrentUser();
        validateMembership(meetingId, granter.getId());
        validateMembership(meetingId, requesterId);

        Map<String, Object> event = Map.of(
                "eventType", "REMOTE_CONTROL_GRANTED",
                "granterId", granter.getId(),
                "requesterId", requesterId,
                "timestamp", LocalDateTime.now().toString()
        );

        messagingTemplate.convertAndSend("/topic/private/" + requesterId, (Object) event);
        messagingTemplate.convertAndSend("/topic/screenshare/" + meetingId, (Object) event);
        logInfo("User " + granter.getUsername() + " granted remote control to: " + requesterId);
    }

    public void revokeRemoteControl(String meetingId, String requesterId) {
        User revoker = getCurrentUser();
        validateMembership(meetingId, revoker.getId());
        validateMembership(meetingId, requesterId);

        Map<String, Object> event = Map.of(
                "eventType", "REMOTE_CONTROL_REVOKED",
                "revokerId", revoker.getId(),
                "requesterId", requesterId,
                "timestamp", LocalDateTime.now().toString()
        );

        messagingTemplate.convertAndSend("/topic/private/" + requesterId, (Object) event);
        messagingTemplate.convertAndSend("/topic/screenshare/" + meetingId, (Object) event);
        logInfo("User " + revoker.getUsername() + " revoked remote control from: " + requesterId);
    }

    // ─── Internal Helpers ─────────────────────────────────────────────────────

    private void stopActiveShareInternal(String meetingId) {
        List<ScreenShareSession> active = sessionRepository.findByMeetingId(meetingId).stream()
                .filter(s -> s.getStatus() == ShareStatus.STARTED || s.getStatus() == ShareStatus.PAUSED)
                .toList();

        for (ScreenShareSession s : active) {
            s.setStatus(ShareStatus.STOPPED);
            s.setEndedAt(LocalDateTime.now());
            sessionRepository.save(s);
            try {
                webrtcService.updateScreenShareState(meetingId, s.getUserId(), false);
            } catch (Exception ignored) {}
        }

        historyRepository.findByMeetingIdAndActive(meetingId, true).ifPresent(h -> {
            h.setActive(false);
            h.setEndTime(LocalDateTime.now());
            historyRepository.save(h);
        });

        if (!active.isEmpty()) {
            broadcastShareEvent(meetingId, "SCREEN_SHARE_STOPPED", Map.<String, Object>of());
            broadcastPresenterEvent(meetingId, "PRESENTER_CHANGED", Map.<String, Object>of("active", false));
        }
    }

    private void validateMembership(String meetingId, String userId) {
        boolean isHost = isHost(meetingId, userId);
        boolean isParticipant = participantRepository.existsByMeetingIdAndUserId(meetingId, userId);
        if (!isHost && !isParticipant) {
            throw new RuntimeException("Access Denied: You are not a member of this meeting");
        }
    }

    private boolean isHost(String meetingId, String userId) {
        return meetingRepository.findByMeetingId(meetingId)
                .map(m -> m.getHostId().equals(userId))
                .orElse(false);
    }

    private void validateSharePermission(String meetingId, String userId) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found: " + meetingId));

        if (!meeting.isScreenShareEnabled() && !meeting.getHostId().equals(userId)) {
            throw new RuntimeException("Screen sharing is disabled in this meeting");
        }

        SharePermission permission = meeting.getSharePermission();
        if (permission == SharePermission.HOST_ONLY && !meeting.getHostId().equals(userId)) {
            throw new RuntimeException("Only the host is allowed to share screen");
        }

        if (permission == SharePermission.CO_HOST) {
            MeetingParticipant p = participantRepository.findByMeetingIdAndUserId(meetingId, userId).orElse(null);
            boolean allowed = meeting.getHostId().equals(userId) ||
                    (p != null && p.getRole() == ParticipantRole.CO_HOST);
            if (!allowed) {
                throw new RuntimeException("Only hosts and co-hosts are allowed to share screen");
            }
        }
    }

    private void broadcastShareEvent(String meetingId, String eventType, Object payload) {
        Map<String, Object> event = Map.of(
                "eventType", eventType,
                "meetingId", meetingId,
                "timestamp", LocalDateTime.now().toString(),
                "payload", payload
        );
        messagingTemplate.convertAndSend("/topic/screenshare/" + meetingId, (Object) event);
    }

    private void broadcastPresenterEvent(String meetingId, String eventType, Object payload) {
        Map<String, Object> event = Map.of(
                "eventType", eventType,
                "meetingId", meetingId,
                "timestamp", LocalDateTime.now().toString(),
                "payload", payload
        );
        messagingTemplate.convertAndSend("/topic/presenter/" + meetingId, (Object) event);
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
