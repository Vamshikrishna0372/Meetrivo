package com.meetrivo.service;

import com.meetrivo.model.*;
import com.meetrivo.repository.MeetingInvitationRepository;
import com.meetrivo.repository.MeetingRepository;
import com.meetrivo.repository.ScheduledMeetingRepository;
import com.meetrivo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvitationService extends BaseService {

    private final MeetingInvitationRepository invitationRepository;
    private final ScheduledMeetingRepository scheduledMeetingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public MeetingInvitation sendInvitation(String meetingId, String receiverEmail) {
        User sender = getCurrentUser();

        // Verify the sender is the host of the meeting
        ScheduledMeeting scheduledMeeting = scheduledMeetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Scheduled meeting not found with ID: " + meetingId));
        if (!scheduledMeeting.getHostId().equals(sender.getId())) {
            throw new RuntimeException("Access Denied: Only the host can invite participants");
        }

        // Prevent duplicate pending or accepted invitations for the same user-meeting combo
        invitationRepository.findByMeetingIdAndReceiverEmail(meetingId, receiverEmail)
                .stream()
                .filter(inv -> inv.getStatus() == InvitationStatus.PENDING || inv.getStatus() == InvitationStatus.ACCEPTED)
                .findFirst()
                .ifPresent(existing -> {
                    throw new RuntimeException("An active invitation already exists for this recipient");
                });

        // Query if receiver is already registered
        User receiver = userRepository.findByEmail(receiverEmail).orElse(null);
        String receiverUserId = receiver != null ? receiver.getId() : null;

        MeetingInvitation invitation = MeetingInvitation.builder()
                .meetingId(meetingId)
                .senderId(sender.getId())
                .receiverEmail(receiverEmail)
                .receiverUserId(receiverUserId)
                .status(InvitationStatus.PENDING)
                .sentAt(LocalDateTime.now())
                .build();

        MeetingInvitation saved = invitationRepository.save(invitation);

        // Notify receiver in real time if registered
        if (receiverUserId != null) {
            notificationService.createNotification(
                    receiverUserId,
                    "Meeting Invitation",
                    "You have been invited to join '" + scheduledMeeting.getTitle() + "' by " + sender.getUsername(),
                    NotificationType.MEETING_INVITATION
            );
        }

        logInfo("Invitation sent from " + sender.getEmail() + " to " + receiverEmail + " for meeting: " + meetingId);
        return saved;
    }

    public MeetingInvitation acceptInvitation(String invitationId) {
        User user = getCurrentUser();
        MeetingInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found: " + invitationId));

        // Security check: validate Invitation Ownership
        boolean isAuthorized = (invitation.getReceiverUserId() != null && invitation.getReceiverUserId().equals(user.getId()))
                || invitation.getReceiverEmail().equalsIgnoreCase(user.getEmail());
        if (!isAuthorized) {
            throw new RuntimeException("Access Denied: This invitation is not addressed to you");
        }

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new RuntimeException("Invitation is not in a pending state");
        }

        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitation.setRespondedAt(LocalDateTime.now());
        if (invitation.getReceiverUserId() == null) {
            invitation.setReceiverUserId(user.getId());
        }

        MeetingInvitation saved = invitationRepository.save(invitation);

        // Notify the meeting host
        ScheduledMeeting scheduledMeeting = scheduledMeetingRepository.findByMeetingId(invitation.getMeetingId()).orElse(null);
        if (scheduledMeeting != null) {
            notificationService.createNotification(
                    scheduledMeeting.getHostId(),
                    "Invitation Accepted",
                    user.getUsername() + " accepted your invitation to '" + scheduledMeeting.getTitle() + "'",
                    NotificationType.SYSTEM_NOTIFICATION
            );
        }

        logInfo("Invitation accepted: " + invitationId + " by " + user.getEmail());
        return saved;
    }

    public MeetingInvitation declineInvitation(String invitationId) {
        User user = getCurrentUser();
        MeetingInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found: " + invitationId));

        // Security check: validate Invitation Ownership
        boolean isAuthorized = (invitation.getReceiverUserId() != null && invitation.getReceiverUserId().equals(user.getId()))
                || invitation.getReceiverEmail().equalsIgnoreCase(user.getEmail());
        if (!isAuthorized) {
            throw new RuntimeException("Access Denied: This invitation is not addressed to you");
        }

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new RuntimeException("Invitation is not in a pending state");
        }

        invitation.setStatus(InvitationStatus.DECLINED);
        invitation.setRespondedAt(LocalDateTime.now());
        if (invitation.getReceiverUserId() == null) {
            invitation.setReceiverUserId(user.getId());
        }

        MeetingInvitation saved = invitationRepository.save(invitation);

        // Notify the meeting host
        ScheduledMeeting scheduledMeeting = scheduledMeetingRepository.findByMeetingId(invitation.getMeetingId()).orElse(null);
        if (scheduledMeeting != null) {
            notificationService.createNotification(
                    scheduledMeeting.getHostId(),
                    "Invitation Declined",
                    user.getUsername() + " declined your invitation to '" + scheduledMeeting.getTitle() + "'",
                    NotificationType.SYSTEM_NOTIFICATION
            );
        }

        logInfo("Invitation declined: " + invitationId + " by " + user.getEmail());
        return saved;
    }

    public MeetingInvitation resendInvitation(String invitationId) {
        User user = getCurrentUser();
        MeetingInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found: " + invitationId));

        // Security validation: Meeting Ownership (Only host can resend)
        ScheduledMeeting scheduledMeeting = scheduledMeetingRepository.findByMeetingId(invitation.getMeetingId())
                .orElseThrow(() -> new RuntimeException("Scheduled meeting not found: " + invitation.getMeetingId()));
        if (!scheduledMeeting.getHostId().equals(user.getId())) {
            throw new RuntimeException("Access Denied: Only the host can resend invitations");
        }

        invitation.setStatus(InvitationStatus.PENDING);
        invitation.setSentAt(LocalDateTime.now());
        MeetingInvitation saved = invitationRepository.save(invitation);

        // Send notification to recipient
        if (invitation.getReceiverUserId() != null) {
            notificationService.createNotification(
                    invitation.getReceiverUserId(),
                    "Meeting Invitation Re-sent",
                    "Invitation to join '" + scheduledMeeting.getTitle() + "' has been re-sent by " + user.getUsername(),
                    NotificationType.MEETING_INVITATION
            );
        }

        logInfo("Invitation re-sent for meeting: " + invitation.getMeetingId() + " to: " + invitation.getReceiverEmail());
        return saved;
    }

    public List<MeetingInvitation> getMyInvitations() {
        User user = getCurrentUser();
        // Return invitations matching email or receiverUserId
        List<MeetingInvitation> list = invitationRepository.findByReceiverUserId(user.getId());
        if (list.isEmpty()) {
            list = invitationRepository.findByReceiverEmail(user.getEmail());
        }
        return list;
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
