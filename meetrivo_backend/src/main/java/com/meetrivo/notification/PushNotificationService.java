package com.meetrivo.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Foundation push notification service supporting FCM (Android) and APNs (iOS).
 * Handles meeting reminders, invitations, recording ready, chat, and organization notifications.
 */
@Slf4j
@Service
public class PushNotificationService {

    /**
     * Send a push notification to a specific device token.
     */
    public void sendToDevice(String deviceToken, String platform, String title, String body, Map<String, String> data) {
        log.info("Sending push notification to device: {} (platform: {}), title: {}", deviceToken, platform, title);
        // Foundation/mock implementation — integrate with FCM or APNs SDK here
        // FCM: POST https://fcm.googleapis.com/fcm/send with Authorization: key=<server_key>
        // APNs: POST https://api.push.apple.com/3/device/<device_token> with JWT auth
        log.info("[PUSH] To: {} | Title: {} | Body: {}", deviceToken, title, body);
        if (data != null && !data.isEmpty()) {
            log.info("[PUSH] Data payload: {}", data);
        }
    }

    /**
     * Send to multiple device tokens.
     */
    public void sendToDevices(List<String> deviceTokens, String platform, String title, String body, Map<String, String> data) {
        log.info("Sending push notification to {} devices on platform: {}", deviceTokens.size(), platform);
        deviceTokens.forEach(token -> sendToDevice(token, platform, title, body, data));
    }

    /**
     * Send meeting reminder push notification.
     */
    public void sendMeetingReminder(String deviceToken, String platform, String meetingTitle, String meetingCode, int minutesBefore) {
        String title = "Meeting Reminder";
        String body = "'" + meetingTitle + "' starts in " + minutesBefore + " minutes. Code: " + meetingCode;
        Map<String, String> data = Map.of(
                "type", "MEETING_REMINDER",
                "meetingCode", meetingCode,
                "minutesBefore", String.valueOf(minutesBefore)
        );
        sendToDevice(deviceToken, platform, title, body, data);
        log.info("Meeting reminder sent for: {}", meetingTitle);
    }

    /**
     * Send organization invitation push notification.
     */
    public void sendInvitationNotification(String deviceToken, String platform, String organizationName, String invitationId) {
        String title = "Organization Invitation";
        String body = "You've been invited to join " + organizationName;
        Map<String, String> data = Map.of(
                "type", "ORGANIZATION_INVITATION",
                "invitationId", invitationId,
                "organizationName", organizationName
        );
        sendToDevice(deviceToken, platform, title, body, data);
        log.info("Invitation notification sent for organization: {}", organizationName);
    }

    /**
     * Send recording ready push notification.
     */
    public void sendRecordingReadyNotification(String deviceToken, String platform, String meetingTitle, String recordingId) {
        String title = "Recording Ready";
        String body = "Your recording for '" + meetingTitle + "' is ready to view and download.";
        Map<String, String> data = Map.of(
                "type", "RECORDING_READY",
                "recordingId", recordingId,
                "meetingTitle", meetingTitle
        );
        sendToDevice(deviceToken, platform, title, body, data);
        log.info("Recording ready notification sent for: {}", meetingTitle);
    }

    /**
     * Send chat message push notification.
     */
    public void sendChatNotification(String deviceToken, String platform, String senderName, String messagePreview, String meetingId) {
        String title = senderName + " sent a message";
        String body = messagePreview.length() > 80 ? messagePreview.substring(0, 80) + "..." : messagePreview;
        Map<String, String> data = Map.of(
                "type", "CHAT_MESSAGE",
                "senderName", senderName,
                "meetingId", meetingId != null ? meetingId : ""
        );
        sendToDevice(deviceToken, platform, title, body, data);
    }

    /**
     * Send organization update push notification.
     */
    public void sendOrganizationNotification(String deviceToken, String platform, String orgName, String event, String details) {
        String title = "Organization Update: " + orgName;
        String body = details;
        Map<String, String> data = Map.of(
                "type", "ORGANIZATION_NOTIFICATION",
                "event", event,
                "organizationName", orgName
        );
        sendToDevice(deviceToken, platform, title, body, data);
        log.info("Organization notification sent - event: {} for org: {}", event, orgName);
    }

    /**
     * Send a generic test notification.
     */
    public void sendTestNotification(String deviceToken, String platform) {
        String title = "Meetrivo Test Notification";
        String body = "Push notifications are working correctly!";
        Map<String, String> data = Map.of("type", "TEST");
        sendToDevice(deviceToken, platform, title, body, data);
        log.info("Test notification sent to device: {}", deviceToken);
    }
}
