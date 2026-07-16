package com.meetrivo.service;

import com.meetrivo.dto.JoinMeetingRequest;
import com.meetrivo.dto.ParticipantResponse;
import com.meetrivo.model.*;
import com.meetrivo.model.AnalyticsEventType;
import com.meetrivo.repository.MeetingParticipantRepository;
import com.meetrivo.repository.MeetingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JoinService extends BaseService {

    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository meetingParticipantRepository;
    private final MeetingPresenceService presenceService;
    private final AnalyticsService analyticsService;
    private final AttendanceService attendanceService;

    public ParticipantResponse joinMeeting(JoinMeetingRequest request) {
        String identifier = request.getMeetingIdentifier();
        System.out.println("[DEBUG][JOIN] identifier received=" + identifier);

        // Find meeting by ID or Code
        Meeting meeting = meetingRepository.findByMeetingId(identifier)
                .or(() -> meetingRepository.findByMeetingCode(identifier))
                .orElseThrow(() -> new RuntimeException("Meeting not found with identifier: " + identifier));
        System.out.println("[DEBUG][JOIN] meeting found: meetingId=" + meeting.getMeetingId() + " meetingCode=" + meeting.getMeetingCode());

        User user = getCurrentUser();
        // Host role if current user is the host
        ParticipantRole role = meeting.getHostId().equals(user.getId()) ? ParticipantRole.HOST : ParticipantRole.PARTICIPANT;

        if (meeting.getStatus() == MeetingStatus.ENDED) {
            throw new RuntimeException("This meeting has already ended.");
        }
        if (meeting.getStatus() == MeetingStatus.CANCELLED) {
            throw new RuntimeException("This meeting has been cancelled.");
        }
        if (meeting.getScheduledEndTime() != null && meeting.getScheduledEndTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("This meeting has expired.");
        }
        if (meeting.getStatus() == MeetingStatus.SCHEDULED && role != ParticipantRole.HOST) {
            throw new RuntimeException("This meeting has not started yet.");
        }
        if (meeting.getStatus() == MeetingStatus.SCHEDULED && role == ParticipantRole.HOST) {
            meeting.setStatus(MeetingStatus.ACTIVE);
            meeting.setActualStartTime(LocalDateTime.now());
            meetingRepository.save(meeting);
        }

        // Validate password if protected
        validateMeetingPassword(meeting, request.getPassword());

        // Capacity check
        int max = meeting.getMaxParticipants() > 0 ? meeting.getMaxParticipants() : 100;
        if (meeting.getParticipantCount() >= max && role != ParticipantRole.HOST) {
            throw new RuntimeException("Meeting is full. Max capacity is " + max + " participants.");
        }

        // Check if meeting is locked
        if (meeting.isLocked() && role != ParticipantRole.HOST) {
            Optional<MeetingParticipant> existing = meetingParticipantRepository.findByMeetingIdAndUserId(meeting.getMeetingId(), user.getId());
            if (existing.isEmpty() || (existing.get().getRole() != ParticipantRole.HOST && existing.get().getRole() != ParticipantRole.CO_HOST && existing.get().getRole() != ParticipantRole.MODERATOR)) {
                throw new RuntimeException("This meeting is locked by the host.");
            }
        }

        MeetingParticipant participant = addParticipant(meeting, user, role);
        try {
            if (participant.isApproved()) {
                presenceService.handleUserJoined(meeting.getMeetingId(), user.getId());
            } else {
                presenceService.handleUserWaiting(meeting.getMeetingId(), user.getId());
            }
        } catch (Exception e) {
            logError("Failed to broadcast real-time user join/waiting event", e);
        }
        analyticsService.trackEvent(AnalyticsEventType.MEETING_JOINED, user.getId(), meeting.getMeetingId(), null);
        logInfo("User: " + user.getUsername() + " joined/waiting in meeting: " + meeting.getMeetingId() + " as role: " + role);

        return mapToParticipantResponse(participant);
    }

    public void leaveMeeting(String meetingId) {
        User user = getCurrentUser();
        removeParticipant(meetingId, user.getId());
        try {
            presenceService.handleUserLeft(meetingId, user.getId());
        } catch (Exception e) {
            logError("Failed to broadcast real-time user leave event", e);
        }
        logInfo("User: " + user.getUsername() + " left meeting: " + meetingId);
    }

    public void validateMeetingPassword(Meeting meeting, String password) {
        if (meeting.isPasswordProtected()) {
            if (password == null || password.trim().isEmpty()) {
                throw new RuntimeException("Meeting is password-protected. Password is required.");
            }
            if (!meeting.getMeetingPassword().equals(password)) {
                throw new RuntimeException("Invalid meeting password");
            }
        }
    }

    public MeetingParticipant addParticipant(Meeting meeting, User user, ParticipantRole role) {
        Optional<MeetingParticipant> existing = meetingParticipantRepository
                .findByMeetingIdAndUserId(meeting.getMeetingId(), user.getId());

        boolean isApproved = true;
        // If waiting room is enabled, and user is not Host/Co-host/Moderator
        if (meeting.isWaitingRoomEnabled() && role != ParticipantRole.HOST && role != ParticipantRole.CO_HOST && role != ParticipantRole.MODERATOR) {
            isApproved = false;
        }

        MeetingParticipant participant;
        if (existing.isPresent()) {
            participant = existing.get();
            if (participant.isBanned()) {
                throw new RuntimeException("You have been banned from this meeting by the host.");
            }
            participant.setActive(isApproved);
            participant.setApproved(isApproved);
            participant.setJoinedAt(LocalDateTime.now());
            participant.setLeftAt(null);
            participant.setRole(role);
            participant.setUsername(user.getUsername());
            participant.setDisplayName(user.getFullName() != null ? user.getFullName() : user.getUsername());
        } else {
            participant = MeetingParticipant.builder()
                    .meetingId(meeting.getMeetingId())
                    .userId(user.getId())
                    .username(user.getUsername())
                    .displayName(user.getFullName() != null ? user.getFullName() : user.getUsername())
                    .role(role)
                    .joinedAt(LocalDateTime.now())
                    .isActive(isApproved)
                    .isApproved(isApproved)
                    .isBanned(false)
                    .build();
        }

        MeetingParticipant savedParticipant = meetingParticipantRepository.save(participant);
        System.out.println("[DEBUG][PARTICIPANT] saved: meetingId=" + savedParticipant.getMeetingId()
            + " userId=" + savedParticipant.getUserId()
            + " username=" + savedParticipant.getUsername()
            + " role=" + savedParticipant.getRole()
            + " approved=" + savedParticipant.isApproved());
        if (savedParticipant.isApproved()) {
            attendanceService.recordJoin(meeting.getMeetingId(), user.getId(), user.getUsername(), user.getFullName());
        }
        updateParticipantCount(meeting.getMeetingId());
        return savedParticipant;
    }

    public ParticipantResponse approveParticipant(String meetingId, String userId) {
        MeetingParticipant participant = meetingParticipantRepository
                .findByMeetingIdAndUserId(meetingId, userId)
                .orElseThrow(() -> new RuntimeException("Participant not found in waiting room"));
        participant.setApproved(true);
        participant.setActive(true);
        participant.setJoinedAt(LocalDateTime.now());
        meetingParticipantRepository.save(participant);
        attendanceService.recordJoin(meetingId, userId, participant.getUsername(), participant.getDisplayName());
        updateParticipantCount(meetingId);
        try {
            presenceService.handleUserJoined(meetingId, userId);
        } catch (Exception e) {
            logError("Failed to broadcast admit event", e);
        }
        return mapToParticipantResponse(participant);
    }

    public void rejectParticipant(String meetingId, String userId) {
        MeetingParticipant participant = meetingParticipantRepository
                .findByMeetingIdAndUserId(meetingId, userId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        participant.setApproved(false);
        participant.setActive(false);
        participant.setLeftAt(LocalDateTime.now());
        meetingParticipantRepository.save(participant);
        try {
            presenceService.handleUserWaitingLeave(meetingId, userId, participant.getUsername());
        } catch (Exception e) {
            logError("Failed to broadcast reject event", e);
        }
    }

    public void removeParticipant(String meetingId, String userId) {
        MeetingParticipant participant = meetingParticipantRepository
                .findByMeetingIdAndUserId(meetingId, userId)
                .orElseThrow(() -> new RuntimeException("Participant record not found for user in this meeting"));

        participant.setActive(false);
        participant.setLeftAt(LocalDateTime.now());
        meetingParticipantRepository.save(participant);
        attendanceService.recordLeave(meetingId, userId);

        updateParticipantCount(meetingId);
    }

    private void updateParticipantCount(String meetingId) {
        long activeCount = meetingParticipantRepository.countByMeetingIdAndIsActiveTrue(meetingId);
        meetingRepository.findByMeetingId(meetingId).ifPresent(meeting -> {
            meeting.setParticipantCount((int) activeCount);
            meetingRepository.save(meeting);
        });
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public ParticipantResponse joinByQrToken(String token) {
        Meeting meeting = meetingRepository.findByQrToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid QR code or meeting not found."));

        if (meeting.getQrExpiresAt() == null || meeting.getQrExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("This QR code has expired.");
        }

        User user = getCurrentUser();
        ParticipantRole role = meeting.getHostId().equals(user.getId()) ? ParticipantRole.HOST : ParticipantRole.PARTICIPANT;

        if (meeting.getStatus() == MeetingStatus.ENDED) {
            throw new RuntimeException("This meeting has already ended.");
        }
        if (meeting.getStatus() == MeetingStatus.CANCELLED) {
            throw new RuntimeException("This meeting has been cancelled.");
        }
        if (meeting.getScheduledEndTime() != null && meeting.getScheduledEndTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("This meeting has expired.");
        }
        if (meeting.getStatus() == MeetingStatus.SCHEDULED && role != ParticipantRole.HOST) {
            throw new RuntimeException("This meeting has not started yet.");
        }
        if (meeting.getStatus() == MeetingStatus.SCHEDULED && role == ParticipantRole.HOST) {
            meeting.setStatus(MeetingStatus.ACTIVE);
            meeting.setActualStartTime(LocalDateTime.now());
            meetingRepository.save(meeting);
        }

        // Capacity check
        int max = meeting.getMaxParticipants() > 0 ? meeting.getMaxParticipants() : 100;
        if (meeting.getParticipantCount() >= max && role != ParticipantRole.HOST) {
            throw new RuntimeException("Meeting is full. Max capacity is " + max + " participants.");
        }

        // Duplicate Join check
        Optional<MeetingParticipant> existing = meetingParticipantRepository.findByMeetingIdAndUserId(meeting.getMeetingId(), user.getId());
        if (existing.isPresent()) {
            MeetingParticipant p = existing.get();
            if (p.isBanned()) {
                throw new RuntimeException("You have been banned from this meeting by the host.");
            }
            if (p.isActive() && p.isApproved() && role != ParticipantRole.HOST) {
                throw new RuntimeException("Duplicate Join: You are already active in this meeting.");
            }
        }

        // Add participant (QR join bypasses password protection)
        MeetingParticipant participant = addParticipant(meeting, user, role);
        try {
            if (participant.isApproved()) {
                presenceService.handleUserJoined(meeting.getMeetingId(), user.getId());
            } else {
                presenceService.handleUserWaiting(meeting.getMeetingId(), user.getId());
            }
        } catch (Exception e) {
            logError("Failed to broadcast real-time user QR join event", e);
        }
        analyticsService.trackEvent(AnalyticsEventType.MEETING_JOINED, user.getId(), meeting.getMeetingId(), null);
        logInfo("User: " + user.getUsername() + " joined via QR in meeting: " + meeting.getMeetingId() + " as role: " + role);

        return mapToParticipantResponse(participant);
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
