package com.meetrivo.service;

import com.meetrivo.model.*;
import com.meetrivo.repository.MeetingInvitationRepository;
import com.meetrivo.repository.MeetingRepository;
import com.meetrivo.repository.NotificationRepository;
import com.meetrivo.repository.ScheduledMeetingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReminderService extends BaseService {

    private final ScheduledMeetingRepository scheduledMeetingRepository;
    private final MeetingRepository meetingRepository;
    private final MeetingInvitationRepository invitationRepository;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;

    /**
     * Sends reminders 24 hours before a scheduled meeting.
     * Runs every hour on the hour.
     */
    @Scheduled(cron = "0 0 * * * *")
    public void send24HourReminders() {
        LocalDateTime windowStart = LocalDateTime.now().plusHours(23).plusMinutes(55);
        LocalDateTime windowEnd   = LocalDateTime.now().plusHours(24).plusMinutes(5);

        List<ScheduledMeeting> meetings = scheduledMeetingRepository.findByStartTimeBetween(windowStart, windowEnd);
        for (ScheduledMeeting meeting : meetings) {
            if (meeting.getStatus() != ScheduledMeetingStatus.UPCOMING) continue;
            sendReminderToHost(meeting, "24 hours");
            sendReminderToInvitees(meeting, "24 hours");
        }
        logInfo("24-hour reminder job executed. Meetings processed: " + meetings.size());
    }

    /**
     * Sends reminders 1 hour before a scheduled meeting.
     * Runs every 15 minutes.
     */
    @Scheduled(cron = "0 */15 * * * *")
    public void send1HourReminders() {
        LocalDateTime windowStart = LocalDateTime.now().plusMinutes(55);
        LocalDateTime windowEnd   = LocalDateTime.now().plusMinutes(65);

        List<ScheduledMeeting> meetings = scheduledMeetingRepository.findByStartTimeBetween(windowStart, windowEnd);
        for (ScheduledMeeting meeting : meetings) {
            if (meeting.getStatus() != ScheduledMeetingStatus.UPCOMING) continue;
            sendReminderToHost(meeting, "1 hour");
            sendReminderToInvitees(meeting, "1 hour");
        }
        logInfo("1-hour reminder job executed. Meetings processed: " + meetings.size());
    }

    /**
     * Sends reminders 15 minutes before a scheduled meeting.
     * Runs every 5 minutes.
     */
    @Scheduled(cron = "0 */5 * * * *")
    public void send15MinuteReminders() {
        LocalDateTime windowStart = LocalDateTime.now().plusMinutes(10);
        LocalDateTime windowEnd   = LocalDateTime.now().plusMinutes(20);

        List<ScheduledMeeting> meetings = scheduledMeetingRepository.findByStartTimeBetween(windowStart, windowEnd);
        for (ScheduledMeeting meeting : meetings) {
            if (meeting.getStatus() != ScheduledMeetingStatus.UPCOMING) continue;
            sendReminderToHost(meeting, "15 minutes");
            sendReminderToInvitees(meeting, "15 minutes");
        }
        logInfo("15-minute reminder job executed. Meetings processed: " + meetings.size());
    }

    /**
     * Auto-transitions UPCOMING meetings to COMPLETED if past their endTime.
     * Runs every 10 minutes.
     */
    @Scheduled(cron = "0 */10 * * * *")
    public void autoCompletePastMeetings() {
        List<ScheduledMeeting> upcoming = scheduledMeetingRepository.findByStatus(ScheduledMeetingStatus.UPCOMING);
        int count = 0;
        for (ScheduledMeeting meeting : upcoming) {
            if (meeting.getEndTime() != null && meeting.getEndTime().isBefore(LocalDateTime.now())) {
                meeting.setStatus(ScheduledMeetingStatus.COMPLETED);
                meeting.setUpdatedAt(LocalDateTime.now());
                scheduledMeetingRepository.save(meeting);
                count++;
            }
        }
        if (count > 0) {
            logInfo("Auto-completed " + count + " past meetings.");
        }
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    /**
     * Sends notifications exactly when a meeting starts.
     * Runs every minute.
     */
    @Scheduled(cron = "0 * * * * *")
    public void sendMeetingStartReminders() {
        LocalDateTime now = LocalDateTime.now();
        // Look for meetings starting within the current minute window
        LocalDateTime windowStart = now.minusSeconds(30);
        LocalDateTime windowEnd   = now.plusSeconds(30);

        List<ScheduledMeeting> meetings = scheduledMeetingRepository.findByStartTimeBetween(windowStart, windowEnd);
        for (ScheduledMeeting meeting : meetings) {
            if (meeting.getStatus() != ScheduledMeetingStatus.UPCOMING) continue;

            // Transition scheduled meeting status to ONGOING
            meeting.setStatus(ScheduledMeetingStatus.ONGOING);
            meeting.setUpdatedAt(now);
            scheduledMeetingRepository.save(meeting);

            // Update underlying Meeting room status to ACTIVE
            meetingRepository.findByMeetingId(meeting.getMeetingId()).ifPresent(m -> {
                m.setStatus(MeetingStatus.ACTIVE);
                m.setActualStartTime(now);
                meetingRepository.save(m);
            });

            // Send MEETING_STARTED notifications to host and accepted invitees
            sendStartNotificationToHost(meeting);
            sendStartNotificationToInvitees(meeting);
        }
        if (!meetings.isEmpty()) {
            logInfo("Meeting start reminder job executed. Meetings started: " + meetings.size());
        }
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    private void sendReminderToHost(ScheduledMeeting meeting, String timeLabel) {
        // Guard: skip if host already has an unread reminder for this meeting in this window
        boolean alreadyNotified = notificationRepository.existsByUserIdAndTitleContainingAndReadFalse(
                meeting.getHostId(), meeting.getMeetingId());
        if (alreadyNotified) return;

        notificationService.createNotification(
                meeting.getHostId(),
                "Meeting Reminder - " + meeting.getMeetingId(),
                "Your meeting '" + meeting.getTitle() + "' starts in " + timeLabel + ". Meeting ID: " + meeting.getMeetingId(),
                NotificationType.MEETING_REMINDER
        );
    }

    private void sendReminderToInvitees(ScheduledMeeting meeting, String timeLabel) {
        List<MeetingInvitation> accepted = invitationRepository.findByMeetingIdAndStatus(
                meeting.getMeetingId(), InvitationStatus.ACCEPTED);
        for (MeetingInvitation invitation : accepted) {
            if (invitation.getReceiverUserId() == null) continue;

            // Guard: skip if invitee already has an unread reminder for this meeting in this window
            boolean alreadyNotified = notificationRepository.existsByUserIdAndTitleContainingAndReadFalse(
                    invitation.getReceiverUserId(), meeting.getMeetingId());
            if (alreadyNotified) continue;

            notificationService.createNotification(
                    invitation.getReceiverUserId(),
                    "Meeting Reminder - " + meeting.getMeetingId(),
                    "Meeting '" + meeting.getTitle() + "' starts in " + timeLabel + ". Meeting ID: " + meeting.getMeetingId(),
                    NotificationType.MEETING_REMINDER
            );
        }
    }

    private void sendStartNotificationToHost(ScheduledMeeting meeting) {
        notificationService.createNotification(
                meeting.getHostId(),
                "Meeting Started - " + meeting.getMeetingId(),
                "Your meeting '" + meeting.getTitle() + "' is starting now! Join the room.",
                NotificationType.MEETING_STARTED
        );
    }

    private void sendStartNotificationToInvitees(ScheduledMeeting meeting) {
        List<MeetingInvitation> accepted = invitationRepository.findByMeetingIdAndStatus(
                meeting.getMeetingId(), InvitationStatus.ACCEPTED);
        for (MeetingInvitation invitation : accepted) {
            if (invitation.getReceiverUserId() == null) continue;

            notificationService.createNotification(
                    invitation.getReceiverUserId(),
                    "Meeting Started - " + meeting.getMeetingId(),
                    "Meeting '" + meeting.getTitle() + "' has started! Join the room.",
                    NotificationType.MEETING_STARTED
            );
        }
    }
}
