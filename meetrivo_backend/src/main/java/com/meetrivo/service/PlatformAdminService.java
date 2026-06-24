package com.meetrivo.service;

import com.meetrivo.dto.DashboardStatsResponse;
import com.meetrivo.model.*;
import com.meetrivo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlatformAdminService extends BaseService {

    private final UserRepository userRepository;
    private final MeetingRepository meetingRepository;
    private final MeetingRecordingRepository recordingRepository;
    private final MeetingInvitationRepository invitationRepository;
    private final NotificationRepository notificationRepository;
    private final MeetingParticipantRepository participantRepository;
    private final PlatformSettingRepository settingRepository;
    private final AnnouncementRepository announcementRepository;
    
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    // ─── Security Helpers ────────────────────────────────────────────────────

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private void validateSuperAdmin() {
        User user = getCurrentUser();
        if (user.getRole() != Role.SUPER_ADMIN) {
            throw new RuntimeException("Access Denied: Super Admin role required");
        }
    }

    private void validateAdminOrSuperAdmin() {
        User user = getCurrentUser();
        if (user.getRole() != Role.ADMIN && user.getRole() != Role.SUPER_ADMIN) {
            throw new RuntimeException("Access Denied: Admin or Super Admin role required");
        }
    }

    // ─── Admin Dashboard Stats ───────────────────────────────────────────────

    public DashboardStatsResponse getStats() {
        validateAdminOrSuperAdmin();

        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByAccountStatus(AccountStatus.ACTIVE);
        long totalMeetings = meetingRepository.count();
        long liveMeetings = meetingRepository.findByStatus(MeetingStatus.ACTIVE).size();
        long totalRecordings = recordingRepository.count();
        long totalInvitations = invitationRepository.count();
        long totalNotifications = notificationRepository.count();

        return DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .totalMeetings(totalMeetings)
                .liveMeetings(liveMeetings)
                .totalRecordings(totalRecordings)
                .totalInvitations(totalInvitations)
                .totalNotifications(totalNotifications)
                .build();
    }

    public List<AuditLog> getRecentActivity() {
        validateAdminOrSuperAdmin();
        // Return latest 50 audit logs
        return auditLogService.getAllLogs().stream().limit(50).collect(Collectors.toList());
    }

    // ─── User Management ─────────────────────────────────────────────────────

    public List<User> getAllUsers() {
        validateAdminOrSuperAdmin();
        return userRepository.findAll();
    }

    @Cacheable(value = "users", key = "#userId")
    public User getUserById(String userId) {
        validateAdminOrSuperAdmin();
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
    }

    @CacheEvict(value = "users", key = "#userId")
    public User updateUser(String userId, User updates) {
        validateAdminOrSuperAdmin();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        user.setFullName(updates.getFullName());
        user.setBio(updates.getBio());
        user.setProfilePicture(updates.getProfilePicture());
        user.setEmail(updates.getEmail());
        user.setUsername(updates.getUsername());
        user.setUpdatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);

        User actor = getCurrentUser();
        auditLogService.logAction(
                "USER_UPDATE",
                actor.getEmail(),
                saved.getId(),
                "USER",
                "Updated details for user: " + saved.getEmail()
        );

        return saved;
    }

    @CacheEvict(value = "users", key = "#userId")
    public void deleteUser(String userId) {
        validateSuperAdmin(); // Restrict deletion to Super Admin
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        userRepository.deleteById(userId);

        User actor = getCurrentUser();
        auditLogService.logAction(
                "USER_DELETE",
                actor.getEmail(),
                userId,
                "USER",
                "Deleted user: " + user.getEmail()
        );
    }

    // ─── Account Moderation ──────────────────────────────────────────────────

    public User activateUser(String userId) {
        validateAdminOrSuperAdmin();
        return updateAccountStatus(userId, AccountStatus.ACTIVE, "USER_ACTIVATE");
    }

    public User deactivateUser(String userId) {
        validateAdminOrSuperAdmin();
        return updateAccountStatus(userId, AccountStatus.INACTIVE, "USER_DEACTIVATE");
    }

    public User suspendUser(String userId) {
        validateAdminOrSuperAdmin();
        User user = updateAccountStatus(userId, AccountStatus.SUSPENDED, "USER_SUSPEND");

        // Broadcast notification to user
        notificationService.createNotification(
                userId,
                "Account Suspended",
                "Your account has been suspended by a platform administrator.",
                NotificationType.SYSTEM_NOTIFICATION
        );

        return user;
    }

    public User blockUser(String userId) {
        validateAdminOrSuperAdmin();
        return updateAccountStatus(userId, AccountStatus.BLOCKED, "USER_BLOCK");
    }

    public User unblockUser(String userId) {
        validateAdminOrSuperAdmin();
        return updateAccountStatus(userId, AccountStatus.ACTIVE, "USER_UNBLOCK");
    }

    private User updateAccountStatus(String userId, AccountStatus status, String actionType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        user.setAccountStatus(status);
        user.setUpdatedAt(LocalDateTime.now());
        User saved = userRepository.save(user);

        User actor = getCurrentUser();
        auditLogService.logAction(
                actionType,
                actor.getEmail(),
                userId,
                "USER",
                "Updated user status to: " + status.name()
        );

        return saved;
    }

    // ─── Role Management ─────────────────────────────────────────────────────

    public User updateUserRole(String userId, Role role) {
        validateSuperAdmin(); // ONLY Super Admin can change roles

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        user.setRole(role);
        user.setUpdatedAt(LocalDateTime.now());
        User saved = userRepository.save(user);

        User actor = getCurrentUser();
        auditLogService.logAction(
                "USER_ROLE_UPDATE",
                actor.getEmail(),
                userId,
                "USER",
                "Promoted/Demoted user to role: " + role.name()
        );

        return saved;
    }

    // ─── Meeting Moderation ──────────────────────────────────────────────────

    public List<Meeting> getAllMeetings() {
        validateAdminOrSuperAdmin();
        return meetingRepository.findAll();
    }

    public Meeting terminateMeeting(String meetingId) {
        validateAdminOrSuperAdmin();

        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found: " + meetingId));

        meeting.setStatus(MeetingStatus.ENDED);
        meeting.setActualEndTime(LocalDateTime.now());
        Meeting saved = meetingRepository.save(meeting);

        // Notify host
        notificationService.createNotification(
                meeting.getHostId(),
                "Meeting Terminated",
                "Your meeting '" + meeting.getTitle() + "' was terminated by a platform administrator.",
                NotificationType.MEETING_CANCELLED
        );

        // Notify active participants
        List<MeetingParticipant> participants = participantRepository.findByMeetingIdAndIsActiveTrue(meetingId);
        for (MeetingParticipant participant : participants) {
            participant.setActive(false);
            participantRepository.save(participant);

            if (participant.getUserId() != null && !participant.getUserId().equals(meeting.getHostId())) {
                notificationService.createNotification(
                        participant.getUserId(),
                        "Meeting Terminated",
                        "The meeting '" + meeting.getTitle() + "' was terminated by a platform administrator.",
                        NotificationType.MEETING_CANCELLED
                );
            }
        }

        User actor = getCurrentUser();
        auditLogService.logAction(
                "MEETING_TERMINATE",
                actor.getEmail(),
                meetingId,
                "MEETING",
                "Terminated meeting: " + meeting.getTitle()
        );

        return saved;
    }

    public void deleteMeeting(String meetingId) {
        validateSuperAdmin(); // ONLY Super Admin can delete meetings

        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found: " + meetingId));

        meetingRepository.deleteById(meetingId);

        User actor = getCurrentUser();
        auditLogService.logAction(
                "MEETING_DELETE",
                actor.getEmail(),
                meetingId,
                "MEETING",
                "Deleted meeting: " + meeting.getTitle()
        );
    }

    public List<MeetingParticipant> getParticipants(String meetingId) {
        validateAdminOrSuperAdmin();
        return participantRepository.findByMeetingId(meetingId);
    }

    // ─── Platform Settings ───────────────────────────────────────────────────

    public List<PlatformSetting> getSettings() {
        validateAdminOrSuperAdmin();
        return settingRepository.findAll();
    }

    public PlatformSetting updateSetting(PlatformSetting setting) {
        validateAdminOrSuperAdmin();
        User actor = getCurrentUser();
        
        setting.setUpdatedBy(actor.getEmail());
        setting.setUpdatedAt(LocalDateTime.now());
        PlatformSetting saved = settingRepository.save(setting);

        auditLogService.logAction(
                "SETTING_UPDATE",
                actor.getEmail(),
                setting.getKey(),
                "SETTING",
                "Updated setting key '" + setting.getKey() + "' to value: " + setting.getValue()
        );

        return saved;
    }

    // ─── Announcements ───────────────────────────────────────────────────────

    public Announcement createAnnouncement(Announcement announcement) {
        validateAdminOrSuperAdmin();
        announcement.setCreatedAt(LocalDateTime.now());
        Announcement saved = announcementRepository.save(announcement);

        User actor = getCurrentUser();
        auditLogService.logAction(
                "ANNOUNCEMENT_CREATE",
                actor.getEmail(),
                saved.getId(),
                "ANNOUNCEMENT",
                "Created system announcement: " + saved.getTitle()
        );

        // Broadcast announcement to all users in real time via system notifications
        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            notificationService.createNotification(
                    user.getId(),
                    "System Announcement: " + saved.getTitle(),
                    saved.getMessage(),
                    NotificationType.SYSTEM_NOTIFICATION
            );
        }

        return saved;
    }

    public Announcement updateAnnouncement(String id, Announcement updates) {
        validateAdminOrSuperAdmin();

        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found: " + id));

        announcement.setTitle(updates.getTitle());
        announcement.setMessage(updates.getMessage());
        announcement.setPriority(updates.getPriority());

        Announcement saved = announcementRepository.save(announcement);

        User actor = getCurrentUser();
        auditLogService.logAction(
                "ANNOUNCEMENT_UPDATE",
                actor.getEmail(),
                id,
                "ANNOUNCEMENT",
                "Updated announcement: " + saved.getTitle()
        );

        return saved;
    }

    public void deleteAnnouncement(String id) {
        validateAdminOrSuperAdmin();

        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found: " + id));

        announcementRepository.deleteById(id);

        User actor = getCurrentUser();
        auditLogService.logAction(
                "ANNOUNCEMENT_DELETE",
                actor.getEmail(),
                id,
                "ANNOUNCEMENT",
                "Deleted announcement: " + announcement.getTitle()
        );
    }

    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findByOrderByCreatedAtDesc();
    }
}
