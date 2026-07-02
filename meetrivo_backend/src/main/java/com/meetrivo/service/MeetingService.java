package com.meetrivo.service;

import com.meetrivo.dto.CreateMeetingRequest;
import com.meetrivo.dto.MeetingResponse;
import com.meetrivo.dto.UpdateMeetingRequest;
import com.meetrivo.model.AnalyticsEventType;
import com.meetrivo.model.Meeting;
import com.meetrivo.model.MeetingStatus;
import com.meetrivo.model.MeetingVisibility;
import com.meetrivo.model.User;
import com.meetrivo.repository.MeetingParticipantRepository;
import com.meetrivo.repository.MeetingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeetingService extends BaseService {

    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository meetingParticipantRepository;
    private final MongoTemplate mongoTemplate;
    private final MeetingPresenceService presenceService;
    private final AnalyticsService analyticsService;
    private final AttendanceService attendanceService;
    private final Random random = new Random();

    @Value("${app.meeting.join-url-prefix:http://localhost:8080/join/}")
    private String joinUrlPrefix;

    public MeetingResponse createMeeting(CreateMeetingRequest request) {
        User host = getCurrentUser();

        String meetingId = UUID.randomUUID().toString();
        String meetingCode = generateUniqueMeetingCode();
        String joinLink = joinUrlPrefix + meetingId;

        MeetingVisibility visibility = MeetingVisibility.PUBLIC;
        if (request.getVisibility() != null) {
            try {
                visibility = MeetingVisibility.valueOf(request.getVisibility().toUpperCase());
            } catch (IllegalArgumentException e) {
                logInfo("Invalid visibility provided, defaulting to PUBLIC: " + request.getVisibility());
            }
        }

        MeetingStatus status = request.isScheduled() ? MeetingStatus.SCHEDULED : MeetingStatus.ACTIVE;
        LocalDateTime actualStartTime = status == MeetingStatus.ACTIVE ? LocalDateTime.now() : null;

        Meeting meeting = Meeting.builder()
                .meetingId(meetingId)
                .meetingCode(meetingCode)
                .title(request.getTitle())
                .description(request.getDescription())
                .hostId(host.getId())
                .hostName(host.getFullName() != null ? host.getFullName() : host.getUsername())
                .status(status)
                .visibility(visibility)
                .passwordProtected(request.isPasswordProtected())
                .meetingPassword(request.isPasswordProtected() ? request.getMeetingPassword() : null)
                .scheduled(request.isScheduled())
                .scheduledStartTime(request.getScheduledStartTime())
                .scheduledEndTime(request.getScheduledEndTime())
                .actualStartTime(actualStartTime)
                .maxParticipants(request.getMaxParticipants() > 0 ? request.getMaxParticipants() : 100)
                .participantCount(0)
                .waitingRoomEnabled(request.isWaitingRoomEnabled())
                .recordingEnabled(request.isRecordingEnabled())
                .chatEnabled(request.isChatEnabled())
                .screenShareEnabled(request.isScreenShareEnabled())
                .joinLink(joinLink)
                .build();

        Meeting savedMeeting = meetingRepository.save(meeting);
        analyticsService.trackEvent(AnalyticsEventType.MEETING_CREATED, host.getId(), savedMeeting.getMeetingId(), null);
        logInfo("Created meeting: " + savedMeeting.getMeetingCode() + " by host: " + host.getUsername());

        return mapToMeetingResponse(savedMeeting);
    }

    @CacheEvict(value = "meetings", key = "#meetingId")
    public MeetingResponse updateMeeting(String meetingId, UpdateMeetingRequest request) {
        User host = getCurrentUser();
        Meeting meeting = getMeetingEntity(meetingId);

        validateHost(meeting, host);

        meeting.setTitle(request.getTitle());
        meeting.setDescription(request.getDescription());
        meeting.setScheduledStartTime(request.getScheduledStartTime());
        meeting.setScheduledEndTime(request.getScheduledEndTime());
        meeting.setMaxParticipants(request.getMaxParticipants() > 0 ? request.getMaxParticipants() : 100);
        meeting.setWaitingRoomEnabled(request.isWaitingRoomEnabled());
        meeting.setRecordingEnabled(request.isRecordingEnabled());
        meeting.setChatEnabled(request.isChatEnabled());
        meeting.setScreenShareEnabled(request.isScreenShareEnabled());

        if (request.getVisibility() != null) {
            try {
                meeting.setVisibility(MeetingVisibility.valueOf(request.getVisibility().toUpperCase()));
            } catch (IllegalArgumentException e) {
                logInfo("Invalid visibility provided during update: " + request.getVisibility());
            }
        }

        Meeting updatedMeeting = meetingRepository.save(meeting);
        logInfo("Updated meeting: " + updatedMeeting.getMeetingId());
        return mapToMeetingResponse(updatedMeeting);
    }

    @CacheEvict(value = "meetings", key = "#meetingId")
    public void deleteMeeting(String meetingId) {
        User host = getCurrentUser();
        Meeting meeting = getMeetingEntity(meetingId);

        validateHost(meeting, host);

        meetingRepository.delete(meeting);
        logInfo("Deleted meeting: " + meetingId);
    }

    @Cacheable(value = "meetings", key = "#meetingId")
    public MeetingResponse getMeeting(String meetingId) {
        Meeting meeting = getMeetingEntity(meetingId);
        return mapToMeetingResponse(meeting);
    }

    public List<MeetingResponse> getMyMeetings() {
        User user = getCurrentUser();
        List<Meeting> meetings = meetingRepository.findByHostIdOrderByCreatedAtDesc(user.getId());
        return meetings.stream()
                .map(this::mapToMeetingResponse)
                .collect(Collectors.toList());
    }

    public MeetingResponse startMeeting(String meetingId) {
        User host = getCurrentUser();
        Meeting meeting = getMeetingEntity(meetingId);

        validateHost(meeting, host);

        if (meeting.getStatus() == MeetingStatus.ENDED) {
            throw new RuntimeException("Cannot start an already ended meeting");
        }

        meeting.setStatus(MeetingStatus.ACTIVE);
        meeting.setActualStartTime(LocalDateTime.now());

        Meeting saved = meetingRepository.save(meeting);
        try {
            presenceService.handleMeetingStarted(meetingId);
        } catch (Exception e) {
            logError("Failed to broadcast real-time meeting started event", e);
        }
        logInfo("Meeting started: " + meetingId);
        return mapToMeetingResponse(saved);
    }

    @CacheEvict(value = "meetings", key = "#meetingId")
    public MeetingResponse endMeeting(String meetingId) {
        User host = getCurrentUser();
        Meeting meeting = getMeetingEntity(meetingId);

        validateHost(meeting, host);

        meeting.setStatus(MeetingStatus.ENDED);
        meeting.setActualEndTime(LocalDateTime.now());
        meeting.setParticipantCount(0);

        // Deactivate all active participants of this meeting
        meetingParticipantRepository.findByMeetingId(meetingId).forEach(participant -> {
            if (participant.isActive()) {
                participant.setActive(false);
                participant.setLeftAt(LocalDateTime.now());
                meetingParticipantRepository.save(participant);
                attendanceService.recordLeave(meetingId, participant.getUserId());
            }
        });

        Meeting saved = meetingRepository.save(meeting);
        analyticsService.trackEvent(AnalyticsEventType.MEETING_ENDED, host.getId(), meetingId, null);

        // Close any associated whiteboard session
        try {
            org.springframework.data.mongodb.core.query.Query queryWb = new org.springframework.data.mongodb.core.query.Query(
                org.springframework.data.mongodb.core.query.Criteria.where("meetingId").is(meetingId)
            );
            org.springframework.data.mongodb.core.query.Update updateWb = new org.springframework.data.mongodb.core.query.Update()
                .set("status", "CLOSED")
                .set("closedAt", LocalDateTime.now());
            mongoTemplate.updateFirst(queryWb, updateWb, "whiteboard_sessions");
        } catch (Exception e) {
            logError("Failed to close whiteboard session on meeting end", e);
        }

        try {
            presenceService.handleMeetingEnded(meetingId);
        } catch (Exception e) {
            logError("Failed to broadcast real-time meeting ended event", e);
        }
        logInfo("Meeting ended: " + meetingId);
        return mapToMeetingResponse(saved);
    }

    public List<MeetingResponse> searchMeetings(String meetingId, String meetingCode, String hostId) {
        Query query = new Query();
        if (meetingId != null && !meetingId.trim().isEmpty()) {
            query.addCriteria(Criteria.where("meetingId").is(meetingId));
        }
        if (meetingCode != null && !meetingCode.trim().isEmpty()) {
            query.addCriteria(Criteria.where("meetingCode").is(meetingCode));
        }
        if (hostId != null && !hostId.trim().isEmpty()) {
            query.addCriteria(Criteria.where("hostId").is(hostId));
        }

        List<Meeting> meetings = mongoTemplate.find(query, Meeting.class);
        return meetings.stream()
                .map(this::mapToMeetingResponse)
                .collect(Collectors.toList());
    }

    private Meeting getMeetingEntity(String meetingId) {
        return meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found with ID: " + meetingId));
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private void validateHost(Meeting meeting, User user) {
        if (!meeting.getHostId().equals(user.getId())) {
            throw new RuntimeException("Only the host can perform this action");
        }
    }

    public void lockMeeting(String meetingId) {
        validateHostOrCoHostOrModerator(meetingId);
        Meeting meeting = getMeetingEntity(meetingId);
        meeting.setLocked(true);
        meetingRepository.save(meeting);
        logInfo("Meeting locked: " + meetingId);
    }

    public void unlockMeeting(String meetingId) {
        validateHostOrCoHostOrModerator(meetingId);
        Meeting meeting = getMeetingEntity(meetingId);
        meeting.setLocked(false);
        meetingRepository.save(meeting);
        logInfo("Meeting unlocked: " + meetingId);
    }

    public void changeMeetingPassword(String meetingId, String password) {
        validateHostOrCoHostOrModerator(meetingId);
        Meeting meeting = getMeetingEntity(meetingId);
        if (password == null || password.trim().isEmpty()) {
            meeting.setPasswordProtected(false);
            meeting.setMeetingPassword(null);
        } else {
            meeting.setPasswordProtected(true);
            meeting.setMeetingPassword(password);
        }
        meetingRepository.save(meeting);
        logInfo("Meeting password updated for: " + meetingId);
    }

    public void approveParticipant(String meetingId, String userId) {
        validateHostOrCoHostOrModerator(meetingId);
        com.meetrivo.model.MeetingParticipant participant = meetingParticipantRepository
                .findByMeetingIdAndUserId(meetingId, userId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        participant.setApproved(true);
        participant.setActive(true);
        meetingParticipantRepository.save(participant);
        try {
            presenceService.handleUserJoined(meetingId, userId);
        } catch (Exception e) {
            logError("Failed to broadcast real-time user approved join event", e);
        }
        logInfo("Participant approved: " + userId + " in meeting: " + meetingId);
    }

    public void rejectParticipant(String meetingId, String userId) {
        validateHostOrCoHostOrModerator(meetingId);
        com.meetrivo.model.MeetingParticipant participant = meetingParticipantRepository
                .findByMeetingIdAndUserId(meetingId, userId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        meetingParticipantRepository.delete(participant);
        try {
            presenceService.handleUserWaitingLeave(meetingId, userId, participant.getUsername());
        } catch (Exception e) {
            logError("Failed to broadcast real-time user rejected waiting room event", e);
        }
        logInfo("Participant rejected and deleted: " + userId + " from meeting: " + meetingId);
    }

    public void removeParticipant(String meetingId, String userId) {
        validateHostOrCoHostOrModerator(meetingId);
        com.meetrivo.model.MeetingParticipant participant = meetingParticipantRepository
                .findByMeetingIdAndUserId(meetingId, userId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        participant.setActive(false);
        participant.setLeftAt(LocalDateTime.now());
        meetingParticipantRepository.save(participant);
        try {
            presenceService.handleUserLeft(meetingId, userId);
        } catch (Exception e) {
            logError("Failed to broadcast real-time user removed event", e);
        }
        logInfo("Participant removed: " + userId + " from meeting: " + meetingId);
    }

    public void banParticipant(String meetingId, String userId) {
        validateHostOrCoHostOrModerator(meetingId);
        com.meetrivo.model.MeetingParticipant participant = meetingParticipantRepository
                .findByMeetingIdAndUserId(meetingId, userId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        participant.setActive(false);
        participant.setLeftAt(LocalDateTime.now());
        participant.setBanned(true);
        meetingParticipantRepository.save(participant);
        try {
            presenceService.handleUserLeft(meetingId, userId);
        } catch (Exception e) {
            logError("Failed to broadcast real-time user banned event", e);
        }
        logInfo("Participant banned: " + userId + " from meeting: " + meetingId);
    }

    public void unbanParticipant(String meetingId, String userId) {
        validateHostOrCoHostOrModerator(meetingId);
        com.meetrivo.model.MeetingParticipant participant = meetingParticipantRepository
                .findByMeetingIdAndUserId(meetingId, userId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        participant.setBanned(false);
        meetingParticipantRepository.save(participant);
        logInfo("Participant unbanned: " + userId + " in meeting: " + meetingId);
    }

    public void assignCoHost(String meetingId, String userId, com.meetrivo.model.ParticipantRole role) {
        User user = getCurrentUser();
        Meeting meeting = getMeetingEntity(meetingId);
        validateHost(meeting, user);

        com.meetrivo.model.MeetingParticipant participant = meetingParticipantRepository
                .findByMeetingIdAndUserId(meetingId, userId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        participant.setRole(role);
        meetingParticipantRepository.save(participant);
        try {
            presenceService.handleUserJoined(meetingId, userId);
        } catch (Exception e) {
            logError("Failed to broadcast real-time user role change event", e);
        }
        logInfo("Participant role updated to " + role + " for user: " + userId + " in meeting: " + meetingId);
    }

    private void validateHostOrCoHostOrModerator(String meetingId) {
        User user = getCurrentUser();
        Meeting meeting = getMeetingEntity(meetingId);
        if (meeting.getHostId().equals(user.getId())) {
            return;
        }

        com.meetrivo.model.MeetingParticipant participant = meetingParticipantRepository
                .findByMeetingIdAndUserId(meetingId, user.getId())
                .orElseThrow(() -> new RuntimeException("Unauthorized: You are not a participant in this meeting"));

        if (participant.getRole() != com.meetrivo.model.ParticipantRole.CO_HOST &&
            participant.getRole() != com.meetrivo.model.ParticipantRole.MODERATOR) {
            throw new RuntimeException("Unauthorized: Host, Co-Host or Moderator privileges required");
        }
    }

    private String generateUniqueMeetingCode() {
        String code;
        do {
            int num = 100000 + random.nextInt(900000);
            code = "MTR-" + num;
        } while (meetingRepository.existsByMeetingCode(code));
        return code;
    }

    public MeetingResponse generateQrToken(String meetingId) {
        validateHostOrCoHostOrModerator(meetingId);
        Meeting meeting = getMeetingEntity(meetingId);
        meeting.setQrToken(UUID.randomUUID().toString());
        meeting.setQrExpiresAt(LocalDateTime.now().plusHours(24));
        Meeting saved = meetingRepository.save(meeting);
        logInfo("Generated secure QR token for meeting: " + meetingId);
        return mapToMeetingResponse(saved);
    }

    public MeetingResponse getQrToken(String meetingId) {
        Meeting meeting = getMeetingEntity(meetingId);
        if (meeting.getQrToken() == null || meeting.getQrExpiresAt() == null || meeting.getQrExpiresAt().isBefore(LocalDateTime.now())) {
            // Auto generate if none exists or expired
            meeting.setQrToken(UUID.randomUUID().toString());
            meeting.setQrExpiresAt(LocalDateTime.now().plusHours(24));
            meeting = meetingRepository.save(meeting);
        }
        return mapToMeetingResponse(meeting);
    }

    private MeetingResponse mapToMeetingResponse(Meeting meeting) {
        return MeetingResponse.builder()
                .id(meeting.getId())
                .meetingId(meeting.getMeetingId())
                .meetingCode(meeting.getMeetingCode())
                .title(meeting.getTitle())
                .description(meeting.getDescription())
                .hostId(meeting.getHostId())
                .hostName(meeting.getHostName())
                .status(meeting.getStatus())
                .visibility(meeting.getVisibility())
                .passwordProtected(meeting.isPasswordProtected())
                .scheduled(meeting.isScheduled())
                .scheduledStartTime(meeting.getScheduledStartTime())
                .scheduledEndTime(meeting.getScheduledEndTime())
                .actualStartTime(meeting.getActualStartTime())
                .actualEndTime(meeting.getActualEndTime())
                .maxParticipants(meeting.getMaxParticipants())
                .participantCount(meeting.getParticipantCount())
                .waitingRoomEnabled(meeting.isWaitingRoomEnabled())
                .locked(meeting.isLocked())
                .recordingEnabled(meeting.isRecordingEnabled())
                .chatEnabled(meeting.isChatEnabled())
                .screenShareEnabled(meeting.isScreenShareEnabled())
                .joinLink(meeting.getJoinLink())
                .qrToken(meeting.getQrToken())
                .qrExpiresAt(meeting.getQrExpiresAt())
                .createdAt(meeting.getCreatedAt())
                .updatedAt(meeting.getUpdatedAt())
                .build();
    }
}
