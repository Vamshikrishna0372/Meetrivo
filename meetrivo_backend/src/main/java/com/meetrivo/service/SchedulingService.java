package com.meetrivo.service;

import com.meetrivo.calendar.CalendarIntegrationService;
import com.meetrivo.dto.CreateMeetingRequest;
import com.meetrivo.dto.MeetingResponse;
import com.meetrivo.model.*;
import com.meetrivo.repository.MeetingInvitationRepository;
import com.meetrivo.repository.MeetingRepository;
import com.meetrivo.repository.ScheduledMeetingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SchedulingService extends BaseService {

    private final ScheduledMeetingRepository scheduledMeetingRepository;
    private final MeetingRepository meetingRepository;
    private final MeetingInvitationRepository invitationRepository;
    private final MeetingService meetingService;
    private final NotificationService notificationService;
    private final CalendarIntegrationService calendarIntegrationService;

    public ScheduledMeeting scheduleMeeting(ScheduledMeeting scheduledMeeting) {
        User host = getCurrentUser();
        scheduledMeeting.setHostId(host.getId());
        scheduledMeeting.setStatus(ScheduledMeetingStatus.UPCOMING);
        scheduledMeeting.setCreatedAt(LocalDateTime.now());
        scheduledMeeting.setUpdatedAt(LocalDateTime.now());

        // Create the underlying Meeting entry to prepare room configurations
        CreateMeetingRequest meetingRequest = CreateMeetingRequest.builder()
                .title(scheduledMeeting.getTitle())
                .description(scheduledMeeting.getDescription())
                .scheduled(true)
                .scheduledStartTime(scheduledMeeting.getStartTime())
                .scheduledEndTime(scheduledMeeting.getEndTime())
                .chatEnabled(true)
                .screenShareEnabled(true)
                .recordingEnabled(true)
                .maxParticipants(100)
                .build();

        MeetingResponse meetingResponse = meetingService.createMeeting(meetingRequest);
        scheduledMeeting.setMeetingId(meetingResponse.getMeetingId());

        ScheduledMeeting saved = scheduledMeetingRepository.save(scheduledMeeting);

        // Sync to external calendars (Google, Outlook, Apple)
        calendarIntegrationService.syncMeeting(saved);

        // Send a system notification to the host
        notificationService.createNotification(
                host.getId(),
                "Meeting Scheduled Successfully",
                "Your meeting '" + saved.getTitle() + "' is scheduled for " + saved.getStartTime(),
                NotificationType.SYSTEM_NOTIFICATION
        );

        logInfo("Meeting scheduled: " + saved.getMeetingId() + " Title: " + saved.getTitle());
        return saved;
    }

    public ScheduledMeeting updateMeetingSchedule(String meetingId, ScheduledMeeting updates) {
        User user = getCurrentUser();
        ScheduledMeeting meeting = scheduledMeetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Scheduled meeting not found: " + meetingId));

        // Security validation: Meeting Ownership
        if (!meeting.getHostId().equals(user.getId())) {
            throw new RuntimeException("Access Denied: You do not own this meeting");
        }

        meeting.setTitle(updates.getTitle());
        meeting.setDescription(updates.getDescription());
        meeting.setStartTime(updates.getStartTime());
        meeting.setEndTime(updates.getEndTime());
        meeting.setTimezone(updates.getTimezone());
        meeting.setRecurring(updates.isRecurring());
        meeting.setRecurrenceRule(updates.getRecurrenceRule());
        meeting.setStatus(updates.getStatus());
        meeting.setUpdatedAt(LocalDateTime.now());

        ScheduledMeeting saved = scheduledMeetingRepository.save(meeting);

        // Update underlying Meeting room details
        meetingRepository.findByMeetingId(meetingId).ifPresent(m -> {
            m.setTitle(updates.getTitle());
            m.setDescription(updates.getDescription());
            m.setScheduledStartTime(updates.getStartTime());
            m.setScheduledEndTime(updates.getEndTime());
            meetingRepository.save(m);
        });

        // Re-sync updated details to external calendars
        calendarIntegrationService.syncMeeting(saved);

        // Send a system notification to the host
        notificationService.createNotification(
                user.getId(),
                "Meeting Updated",
                "Your meeting '" + saved.getTitle() + "' schedule was updated.",
                NotificationType.SYSTEM_NOTIFICATION
        );

        logInfo("Meeting schedule updated: " + meetingId);
        return saved;
    }

    public void cancelMeeting(String meetingId) {
        User user = getCurrentUser();
        ScheduledMeeting meeting = scheduledMeetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Scheduled meeting not found: " + meetingId));

        // Security validation: Meeting Ownership
        if (!meeting.getHostId().equals(user.getId())) {
            throw new RuntimeException("Access Denied: You do not own this meeting");
        }

        meeting.setStatus(ScheduledMeetingStatus.CANCELLED);
        meeting.setUpdatedAt(LocalDateTime.now());
        scheduledMeetingRepository.save(meeting);

        // Update underlying Meeting room status to CANCELLED
        meetingRepository.findByMeetingId(meetingId).ifPresent(m -> {
            m.setStatus(MeetingStatus.CANCELLED);
            meetingRepository.save(m);
        });

        // Notify invited participants about cancellation
        List<MeetingInvitation> invitations = invitationRepository.findByMeetingId(meetingId);
        for (MeetingInvitation invitation : invitations) {
            if (invitation.getStatus() == InvitationStatus.PENDING || invitation.getStatus() == InvitationStatus.ACCEPTED) {
                invitation.setStatus(InvitationStatus.EXPIRED);
                invitationRepository.save(invitation);

                if (invitation.getReceiverUserId() != null) {
                    notificationService.createNotification(
                            invitation.getReceiverUserId(),
                            "Meeting Cancelled",
                            "The meeting '" + meeting.getTitle() + "' has been cancelled by the host.",
                            NotificationType.MEETING_CANCELLED
                    );
                }
            }
        }

        // Notify the host
        notificationService.createNotification(
                user.getId(),
                "Meeting Cancelled",
                "You have successfully cancelled the meeting '" + meeting.getTitle() + "'.",
                NotificationType.SYSTEM_NOTIFICATION
        );

        logInfo("Meeting cancelled: " + meetingId);
    }

    public List<ScheduledMeeting> getUpcomingMeetings() {
        User user = getCurrentUser();
        return scheduledMeetingRepository.findByHostIdAndStartTimeAfterOrderByStartTimeAsc(
                user.getId(), LocalDateTime.now());
    }

    public List<ScheduledMeeting> getPastMeetings() {
        User user = getCurrentUser();
        return scheduledMeetingRepository.findByHostIdAndStartTimeBeforeOrderByStartTimeDesc(
                user.getId(), LocalDateTime.now());
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
