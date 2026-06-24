package com.meetrivo.service;

import com.meetrivo.model.*;
import com.meetrivo.repository.MeetingParticipantRepository;
import com.meetrivo.repository.MeetingRecordingRepository;
import com.meetrivo.repository.MeetingRepository;
import com.meetrivo.repository.RecordingHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.meetrivo.storage.StorageService;
import java.io.ByteArrayInputStream;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecordingService extends BaseService {

    private final MeetingRecordingRepository recordingRepository;
    private final RecordingHistoryRepository historyRepository;
    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository participantRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final StorageService storageService;
    private final AnalyticsService analyticsService;

    // ─── Start Recording ──────────────────────────────────────────────────────

    public MeetingRecording startRecording(String meetingId,
                                           RecordingType recordingType,
                                           RecordingPermission permission) {
        User user = getCurrentUser();
        validateHostOrCoHost(meetingId, user.getId());

        // Prevent duplicate active recordings in the same meeting
        recordingRepository.findByMeetingIdAndStatusIn(
                meetingId, List.of(RecordingStatus.STARTING, RecordingStatus.RECORDING))
                .ifPresent(existing -> {
                    throw new RuntimeException("A recording is already in progress for this meeting");
                });

        String recordingId = UUID.randomUUID().toString();
        String fileName = "recording_" + meetingId + "_" + recordingId + ".webm";

        MeetingRecording recording = MeetingRecording.builder()
                .meetingId(meetingId)
                .recordingId(recordingId)
                .hostId(user.getId())
                .fileName(fileName)
                .recordingType(recordingType)
                .status(RecordingStatus.RECORDING)
                .permission(permission)
                .startedAt(LocalDateTime.now())
                .build();

        MeetingRecording saved = recordingRepository.save(recording);
        auditHistory(meetingId, recordingId, "STARTED", user, "Recording started");

        broadcastRecordingEvent(meetingId, "RECORDING_STARTED", Map.<String, Object>of(
                "recordingId", recordingId,
                "recordingType", recordingType.name(),
                "startedBy", user.getId()
        ));

        logInfo("Recording started: " + recordingId + " in meeting: " + meetingId);
        return saved;
    }

    // ─── Stop Recording ───────────────────────────────────────────────────────

    public MeetingRecording stopRecording(String recordingId) {
        User user = getCurrentUser();
        MeetingRecording recording = findActiveRecording(recordingId);
        validateHostOrCoHost(recording.getMeetingId(), user.getId());

        long durationSeconds = 0;
        if (recording.getStartedAt() != null) {
            durationSeconds = java.time.Duration.between(recording.getStartedAt(), LocalDateTime.now()).getSeconds();
        }

        recording.setStatus(RecordingStatus.PROCESSING);
        recording.setDuration(durationSeconds);
        recording.setCompletedAt(LocalDateTime.now());

        // Create dummy video file in storage to enable playback/download API
        try {
            byte[] dummyData = "DUMMY WEBM DATA".getBytes();
            ByteArrayInputStream inputStream = new ByteArrayInputStream(dummyData);
            String storagePath = storageService.store(inputStream, recording.getFileName(), "video/webm");
            recording.setStoragePath(storagePath);
            recording.setFileSize(storageService.size(storagePath));
        } catch (Exception e) {
            logError("Failed to store dummy recording file on stop", e);
        }

        MeetingRecording saved = recordingRepository.save(recording);

        // Simulate async processing → mark COMPLETED
        recording.setStatus(RecordingStatus.COMPLETED);
        recordingRepository.save(recording);

        auditHistory(recording.getMeetingId(), recordingId, "STOPPED", user,
                "Recording stopped after " + durationSeconds + "s");

        broadcastRecordingEvent(recording.getMeetingId(), "RECORDING_STOPPED", Map.<String, Object>of(
                "recordingId", recordingId,
                "duration", durationSeconds,
                "stoppedBy", user.getId()
        ));

        logInfo("Recording stopped: " + recordingId);
        return saved;
    }

    // ─── Pause Recording ──────────────────────────────────────────────────────

    public MeetingRecording pauseRecording(String recordingId) {
        User user = getCurrentUser();
        MeetingRecording recording = findActiveRecording(recordingId);
        validateHostOrCoHost(recording.getMeetingId(), user.getId());

        if (recording.getStatus() != RecordingStatus.RECORDING) {
            throw new RuntimeException("Recording is not in an active state to pause");
        }

        recording.setStatus(RecordingStatus.PAUSED);
        recording.setPausedAt(LocalDateTime.now());
        MeetingRecording saved = recordingRepository.save(recording);

        auditHistory(recording.getMeetingId(), recordingId, "PAUSED", user, null);

        broadcastRecordingEvent(recording.getMeetingId(), "RECORDING_PAUSED", Map.<String, Object>of(
                "recordingId", recordingId,
                "pausedBy", user.getId()
        ));

        logInfo("Recording paused: " + recordingId);
        return saved;
    }

    // ─── Resume Recording ─────────────────────────────────────────────────────

    public MeetingRecording resumeRecording(String recordingId) {
        User user = getCurrentUser();
        MeetingRecording recording = getRecordingByIdOrThrow(recordingId);
        validateHostOrCoHost(recording.getMeetingId(), user.getId());

        if (recording.getStatus() != RecordingStatus.PAUSED) {
            throw new RuntimeException("Recording is not paused");
        }

        recording.setStatus(RecordingStatus.RECORDING);
        recording.setResumedAt(LocalDateTime.now());
        MeetingRecording saved = recordingRepository.save(recording);

        auditHistory(recording.getMeetingId(), recordingId, "RESUMED", user, null);

        broadcastRecordingEvent(recording.getMeetingId(), "RECORDING_RESUMED", Map.<String, Object>of(
                "recordingId", recordingId,
                "resumedBy", user.getId()
        ));

        logInfo("Recording resumed: " + recordingId);
        return saved;
    }

    // ─── Delete Recording ─────────────────────────────────────────────────────

    public void deleteRecording(String recordingId) {
        User user = getCurrentUser();
        MeetingRecording recording = getRecordingByIdOrThrow(recordingId);
        validateHostOrCoHost(recording.getMeetingId(), user.getId());

        if (recording.getStatus() == RecordingStatus.RECORDING
                || recording.getStatus() == RecordingStatus.STARTING) {
            throw new RuntimeException("Cannot delete a recording that is currently in progress. Stop it first.");
        }

        recording.setStatus(RecordingStatus.DELETED);
        recordingRepository.save(recording);

        auditHistory(recording.getMeetingId(), recordingId, "DELETED", user, null);

        broadcastRecordingEvent(recording.getMeetingId(), "RECORDING_DELETED", Map.<String, Object>of(
                "recordingId", recordingId,
                "deletedBy", user.getId()
        ));

        logInfo("Recording marked as deleted: " + recordingId);
    }

    // ─── Update Permission / Sharing ──────────────────────────────────────────

    public MeetingRecording updatePermission(String recordingId, RecordingPermission permission) {
        User user = getCurrentUser();
        MeetingRecording recording = getRecordingByIdOrThrow(recordingId);
        validateHostOrCoHost(recording.getMeetingId(), user.getId());

        recording.setPermission(permission);

        // Generate a share token when making it shared/public
        if ((permission == RecordingPermission.PARTICIPANTS || permission == RecordingPermission.PUBLIC)
                && recording.getShareToken() == null) {
            recording.setShareToken(UUID.randomUUID().toString().replace("-", ""));
        }

        MeetingRecording saved = recordingRepository.save(recording);
        logInfo("Recording permission updated: " + recordingId + " → " + permission);
        return saved;
    }

    // ─── Queries ──────────────────────────────────────────────────────────────

    public MeetingRecording getRecording(String recordingId) {
        User user = getCurrentUser();
        MeetingRecording recording = getRecordingByIdOrThrow(recordingId);
        validateReadAccess(recording, user);
        return recording;
    }

    public List<MeetingRecording> getMeetingRecordings(String meetingId) {
        User user = getCurrentUser();
        validateMembership(meetingId, user.getId());
        return recordingRepository.findByMeetingId(meetingId).stream()
                .filter(r -> r.getStatus() != RecordingStatus.DELETED)
                .toList();
    }

    public List<MeetingRecording> getMyRecordings() {
        User user = getCurrentUser();
        return recordingRepository.findByHostId(user.getId()).stream()
                .filter(r -> r.getStatus() != RecordingStatus.DELETED)
                .toList();
    }

    public MeetingRecording getByShareToken(String shareToken) {
        MeetingRecording recording = recordingRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new RuntimeException("Recording not found for share token"));
        if (recording.getStatus() == RecordingStatus.DELETED) {
            throw new RuntimeException("This recording has been deleted");
        }
        return recording;
    }

    public List<RecordingHistory> getRecordingHistory(String recordingId) {
        User user = getCurrentUser();
        MeetingRecording recording = getRecordingByIdOrThrow(recordingId);
        validateHostOrCoHost(recording.getMeetingId(), user.getId());
        return historyRepository.findByRecordingIdOrderByTimestampDesc(recordingId);
    }

    // ─── Playback / Download ──────────────────────────────────────────────────

    /**
     * Returns the storage path of the completed recording for streaming.
     * The controller layer handles reading the bytes and building the HTTP response.
     */
    public String resolvePlaybackPath(String recordingId) {
        User user = getCurrentUser();
        MeetingRecording recording = getRecordingByIdOrThrow(recordingId);
        validateReadAccess(recording, user);

        if (recording.getStatus() != RecordingStatus.COMPLETED) {
            throw new RuntimeException("Recording is not yet available for playback");
        }
        return recording.getStoragePath();
    }

    /**
     * Returns the storage path for download; validates ownership.
     */
    public MeetingRecording resolveDownload(String recordingId) {
        User user = getCurrentUser();
        MeetingRecording recording = getRecordingByIdOrThrow(recordingId);
        validateReadAccess(recording, user);

        if (recording.getStatus() != RecordingStatus.COMPLETED) {
            throw new RuntimeException("Recording is not yet available for download");
        }
        return recording;
    }

    public String resolveSharedPlaybackPath(String shareToken) {
        MeetingRecording recording = getByShareToken(shareToken);
        if (recording.getStatus() != RecordingStatus.COMPLETED) {
            throw new RuntimeException("Recording is not yet available for playback");
        }
        return recording.getStoragePath();
    }

    public MeetingRecording resolveSharedDownload(String shareToken) {
        MeetingRecording recording = getByShareToken(shareToken);
        if (recording.getStatus() != RecordingStatus.COMPLETED) {
            throw new RuntimeException("Recording is not yet available for download");
        }
        return recording;
    }

    // ─── Internal Helpers ─────────────────────────────────────────────────────

    private MeetingRecording findActiveRecording(String recordingId) {
        MeetingRecording recording = getRecordingByIdOrThrow(recordingId);
        if (recording.getStatus() == RecordingStatus.COMPLETED
                || recording.getStatus() == RecordingStatus.FAILED
                || recording.getStatus() == RecordingStatus.DELETED) {
            throw new RuntimeException("Recording is not active: " + recordingId);
        }
        return recording;
    }

    private MeetingRecording getRecordingByIdOrThrow(String recordingId) {
        return recordingRepository.findByRecordingId(recordingId)
                .orElseThrow(() -> new RuntimeException("Recording not found: " + recordingId));
    }

    private void validateReadAccess(MeetingRecording recording, User user) {
        boolean isHost = recording.getHostId().equals(user.getId());
        boolean isMeetingHost = isHost(recording.getMeetingId(), user.getId());
        boolean isParticipant = participantRepository.existsByMeetingIdAndUserId(
                recording.getMeetingId(), user.getId());

        switch (recording.getPermission()) {
            case HOST_ONLY:
                if (!isHost && !isMeetingHost) {
                    throw new RuntimeException("Access denied: this recording is private to the host");
                }
                break;
            case CO_HOST:
                boolean isCoHost = participantRepository
                        .findByMeetingIdAndUserId(recording.getMeetingId(), user.getId())
                        .map(p -> p.getRole() == ParticipantRole.CO_HOST)
                        .orElse(false);
                if (!isHost && !isMeetingHost && !isCoHost) {
                    throw new RuntimeException("Access denied: this recording is restricted to hosts and co-hosts");
                }
                break;
            case PARTICIPANTS:
                if (!isHost && !isMeetingHost && !isParticipant) {
                    throw new RuntimeException("Access denied: this recording is restricted to meeting participants");
                }
                break;
            case PUBLIC:
                // anyone with the link / token can access
                break;
        }
    }

    private void validateHostOrCoHost(String meetingId, String userId) {
        boolean isMeetingHost = isHost(meetingId, userId);
        boolean isCoHost = participantRepository
                .findByMeetingIdAndUserId(meetingId, userId)
                .map(p -> p.getRole() == ParticipantRole.CO_HOST)
                .orElse(false);

        if (!isMeetingHost && !isCoHost) {
            throw new RuntimeException("Only the host or co-host can manage recordings");
        }
    }

    private void validateMembership(String meetingId, String userId) {
        boolean isMeetingHost = isHost(meetingId, userId);
        boolean isParticipant = participantRepository.existsByMeetingIdAndUserId(meetingId, userId);
        if (!isMeetingHost && !isParticipant) {
            throw new RuntimeException("Access Denied: You are not a member of this meeting");
        }
    }

    private boolean isHost(String meetingId, String userId) {
        return meetingRepository.findByMeetingId(meetingId)
                .map(m -> m.getHostId().equals(userId))
                .orElse(false);
    }

    private void auditHistory(String meetingId, String recordingId, String action,
                               User performer, String notes) {
        String name = performer.getFullName() != null
                ? performer.getFullName() : performer.getUsername();
        RecordingHistory entry = RecordingHistory.builder()
                .meetingId(meetingId)
                .recordingId(recordingId)
                .action(action)
                .performedById(performer.getId())
                .performedByName(name)
                .timestamp(LocalDateTime.now())
                .notes(notes)
                .build();
        historyRepository.save(entry);
    }

    private void broadcastRecordingEvent(String meetingId, String eventType, Object payload) {
        Map<String, Object> event = Map.of(
                "eventType", eventType,
                "meetingId", meetingId,
                "timestamp", LocalDateTime.now().toString(),
                "payload", payload
        );
        messagingTemplate.convertAndSend("/topic/recording/" + meetingId, (Object) event);
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
