package com.meetrivo.service;

import com.meetrivo.dto.DashboardStatsResponse;
import com.meetrivo.model.*;
import com.meetrivo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
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
    private final OrganizationMemberRepository organizationMemberRepository;
    private final OrganizationRepository organizationRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamRepository teamRepository;
    private final DepartmentRepository departmentRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final AuditLogRepository auditLogRepository;
    private final LoginHistoryRepository loginHistoryRepository;
    private final WhiteboardSessionRepository whiteboardSessionRepository;
    private final BreakoutRoomRepository breakoutRoomRepository;
    private final AnalyticsEventRepository analyticsEventRepository;

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
        if (user.getRole() != Role.ORGANIZATION_ADMIN && user.getRole() != Role.ORGANIZATION_OWNER && user.getRole() != Role.SUPER_ADMIN) {
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

    // ─── User Management ────────────────────────────────────────────────

    public List<User> getAllUsers() {
        return getAllUsers(null, null, null, null, null, null, null, null, null);
    }

    /**
     * Filtered, searched, and sorted user list.
     * All params are optional; null means no filter applied.
     */
    public List<User> getAllUsers(String search, String role, String status,
                                  String sortBy, String sortDir,
                                  String organization, String department, String team, String emailVerified) {
        validateAdminOrSuperAdmin();

        List<User> users = userRepository.findAll();

        // Search by name / username / email / phone
        if (search != null && !search.isBlank()) {
            String lc = search.toLowerCase().trim();
            users = users.stream()
                    .filter(u -> (u.getFullName() != null && u.getFullName().toLowerCase().contains(lc))
                            || (u.getUsername() != null && u.getUsername().toLowerCase().contains(lc))
                            || (u.getEmail() != null && u.getEmail().toLowerCase().contains(lc))
                            || (u.getPhone() != null && u.getPhone().toLowerCase().contains(lc)))
                    .collect(Collectors.toList());
        }

        // Filter by role
        if (role != null && !role.isBlank()) {
            Role roleEnum = Role.fromString(role);
            users = users.stream().filter(u -> u.getRole() == roleEnum).collect(Collectors.toList());
        }

        // Filter by account status
        if (status != null && !status.isBlank()) {
            try {
                AccountStatus statusEnum = AccountStatus.valueOf(status.toUpperCase());
                users = users.stream().filter(u -> u.getAccountStatus() == statusEnum).collect(Collectors.toList());
            } catch (IllegalArgumentException ignored) {}
        }

        // Filter by emailVerified
        if (emailVerified != null && !emailVerified.isBlank()) {
            boolean ev = Boolean.parseBoolean(emailVerified);
            users = users.stream().filter(u -> u.isEmailVerified() == ev).collect(Collectors.toList());
        }

        // Enrich transient membership fields
        users = users.stream().map(this::enrichUser).collect(Collectors.toList());

        // Filter by organization name
        if (organization != null && !organization.isBlank()) {
            String orgLc = organization.toLowerCase();
            users = users.stream()
                    .filter(u -> u.getOrganizationName() != null
                            && u.getOrganizationName().toLowerCase().contains(orgLc))
                    .collect(Collectors.toList());
        }

        // Filter by department name
        if (department != null && !department.isBlank()) {
            String dLc = department.toLowerCase();
            users = users.stream()
                    .filter(u -> u.getDepartmentName() != null
                            && u.getDepartmentName().toLowerCase().contains(dLc))
                    .collect(Collectors.toList());
        }

        // Filter by team name
        if (team != null && !team.isBlank()) {
            String tLc = team.toLowerCase();
            users = users.stream()
                    .filter(u -> u.getTeamName() != null
                            && u.getTeamName().toLowerCase().contains(tLc))
                    .collect(Collectors.toList());
        }

        // Sort
        if (sortBy != null) {
            boolean desc = "desc".equalsIgnoreCase(sortDir);
            Comparator<User> cmp;
            switch (sortBy.toLowerCase()) {
                case "email"   -> cmp = Comparator.comparing(u -> u.getEmail() != null ? u.getEmail() : "");
                case "role"    -> cmp = Comparator.comparing(u -> u.getRole() != null ? u.getRole().name() : "");
                case "status"  -> cmp = Comparator.comparing(u -> u.getAccountStatus() != null ? u.getAccountStatus().name() : "");
                case "createdat", "created_at" -> cmp = Comparator.comparing(
                        u -> u.getCreatedAt() != null ? u.getCreatedAt() : LocalDateTime.MIN);
                case "lastloginat", "last_login" -> cmp = Comparator.comparing(
                        u -> u.getLastLoginAt() != null ? u.getLastLoginAt() : LocalDateTime.MIN);
                default -> cmp = Comparator.comparing(u -> u.getFullName() != null ? u.getFullName().toLowerCase() : "");
            }
            if (desc) cmp = cmp.reversed();
            users.sort(cmp);
        }

        return users;
    }

    /** Populate transient membership fields for a user object. */
    private User enrichUser(User user) {
        // Organization membership
        List<OrganizationMember> memberships = organizationMemberRepository.findByUserId(user.getId());
        if (memberships != null && !memberships.isEmpty()) {
            OrganizationMember membership = memberships.get(0);
            user.setOrganizationId(membership.getOrganizationId());
            organizationRepository.findById(membership.getOrganizationId())
                    .ifPresent(org -> user.setOrganizationName(org.getName()));
        }
        // Team membership
        List<TeamMember> teamMemberships = teamMemberRepository.findByUserId(user.getId());
        if (teamMemberships != null && !teamMemberships.isEmpty()) {
            TeamMember tm = teamMemberships.get(0);
            user.setTeamId(tm.getTeamId());
            teamRepository.findById(tm.getTeamId())
                    .ifPresent(t -> user.setTeamName(t.getName()));
        }
        // Department membership
        departmentRepository.findAll().stream()
                .filter(d -> d.getMemberIds() != null && d.getMemberIds().contains(user.getId()))
                .findFirst()
                .ifPresent(d -> {
                    user.setDepartmentId(d.getId());
                    user.setDepartmentName(d.getName());
                });
        // Last activity
        List<AuditLog> activityLogs = auditLogRepository.findByPerformedByOrderByTimestampDesc(user.getEmail());
        if (activityLogs != null && !activityLogs.isEmpty()) {
            user.setLastActivityAt(activityLogs.get(0).getTimestamp());
        }
        return user;
    }

    /** Compute analytics stats for a single user. */
    public Map<String, Object> getUserAnalytics(String userId) {
        validateAdminOrSuperAdmin();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // Meeting stats
        List<Meeting> hosted = meetingRepository.findByHostId(userId);
        long hostedCount = hosted.size();
        long completedMeetings = hosted.stream().filter(m -> m.getStatus() == MeetingStatus.ENDED).count();
        long cancelledMeetings = hosted.stream().filter(m -> m.getStatus() == MeetingStatus.CANCELLED).count();

        List<MeetingParticipant> participations = participantRepository.findByUserId(userId);
        long joinedCount = participations.stream()
                .filter(p -> p.getRole() != ParticipantRole.HOST).count();

        // Meeting duration in minutes
        long meetingMinutes = hosted.stream()
                .filter(m -> m.getActualStartTime() != null && m.getActualEndTime() != null)
                .mapToLong(m -> Duration.between(m.getActualStartTime(), m.getActualEndTime()).toMinutes())
                .sum();
        long meetingHours = meetingMinutes / 60;
        long avgDuration = hostedCount > 0 ? meetingMinutes / hostedCount : 0;

        // Attendance %
        long totalInvited = invitationRepository.findByReceiverUserId(userId).size();
        double attendancePct = totalInvited > 0 ? Math.round((joinedCount * 100.0 / totalInvited) * 10) / 10.0 : 0;

        // Chat messages
        long chatMessages = chatMessageRepository.countBySenderId(userId);

        // Recordings
        long recordings = recordingRepository.findByHostId(userId).size();

        // Notifications received
        long notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).size();

        // Login count
        long loginCount = loginHistoryRepository.countByUserId(userId);

        // Additional Stats
        long whiteboardSessions = whiteboardSessionRepository.findAll().stream()
                .filter(w -> userId.equals(w.getOwnerId())).count();
                
        long breakoutParticipation = breakoutRoomRepository.findAll().stream()
                .filter(b -> b.getParticipantIds() != null && b.getParticipantIds().contains(userId)).count();
                
        long aiUsageCount = analyticsEventRepository.findAll().stream()
                .filter(a -> userId.equals(a.getUserId()) && a.getEventType().name().startsWith("AI_")).count();
                
        long upcomingMeetings = hosted.stream()
                .filter(m -> m.getStatus() == MeetingStatus.SCHEDULED && m.getScheduledStartTime() != null && m.getScheduledStartTime().isAfter(LocalDateTime.now()))
                .count();

        Map<String, Object> analytics = new LinkedHashMap<>();
        analytics.put("totalMeetings", hostedCount + joinedCount);
        analytics.put("hostedMeetings", hostedCount);
        analytics.put("joinedMeetings", joinedCount);
        analytics.put("completedMeetings", completedMeetings);
        analytics.put("cancelledMeetings", cancelledMeetings);
        analytics.put("meetingHours", meetingHours);
        analytics.put("meetingMinutes", meetingMinutes);
        analytics.put("attendancePercentage", attendancePct);
        analytics.put("averageMeetingDurationMinutes", avgDuration);
        analytics.put("chatMessages", chatMessages);
        analytics.put("recordingsCreated", recordings);
        analytics.put("notificationCount", notifications);
        analytics.put("loginCount", loginCount);
        analytics.put("whiteboardSessions", whiteboardSessions);
        analytics.put("breakoutParticipation", breakoutParticipation);
        analytics.put("aiUsageCount", aiUsageCount);
        analytics.put("upcomingMeetings", upcomingMeetings);
        analytics.put("filesUploaded", 0); // No file repository tracked per user natively
        analytics.put("lastLoginAt", user.getLastLoginAt());
        analytics.put("lastActivityAt", user.getLastActivityAt());
        return analytics;
    }

    /** Return paginated activity audit log for a specific user. */
    public List<AuditLog> getUserActivity(String userId, int limit) {
        validateAdminOrSuperAdmin();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        // Activity = audit log records where this user was the performer or the target
        List<AuditLog> performed = auditLogRepository.findByPerformedByOrderByTimestampDesc(user.getEmail());
        List<AuditLog> affected = auditLogRepository.findByTargetIdOrderByTimestampDesc(userId);
        Set<String> seen = new HashSet<>();
        List<AuditLog> combined = new ArrayList<>();
        for (AuditLog l : performed) { if (seen.add(l.getId())) combined.add(l); }
        for (AuditLog l : affected) { if (seen.add(l.getId())) combined.add(l); }
        combined.sort(Comparator.comparing(AuditLog::getTimestamp, Comparator.nullsLast(Comparator.reverseOrder())));
        return combined.stream().limit(limit).collect(Collectors.toList());
    }

    /** Bulk action on a list of user IDs.
     * action: delete | disable | enable | suspend | block | unblock | verify_email | assign_role | assign_organization | assign_team | assign_department
     * roleValue: role name for assign_role
     * targetId: org/team/dept id for assign_* actions
     */
    public Map<String, Object> bulkUserAction(List<String> userIds, String action, String roleValue, String targetId) {
        validateAdminOrSuperAdmin();
        User actor = getCurrentUser();
        int success = 0;
        int failed = 0;
        for (String uid : userIds) {
            try {
                switch (action.toLowerCase()) {
                    case "delete" -> {
                        validateSuperAdmin();
                        userRepository.deleteById(uid);
                    }
                    case "disable", "deactivate" -> updateAccountStatus(uid, AccountStatus.INACTIVE, "USER_DEACTIVATE");
                    case "enable", "activate"    -> updateAccountStatus(uid, AccountStatus.ACTIVE, "USER_ACTIVATE");
                    case "suspend"               -> updateAccountStatus(uid, AccountStatus.SUSPENDED, "USER_SUSPEND");
                    case "block"                 -> updateAccountStatus(uid, AccountStatus.BLOCKED, "USER_BLOCK");
                    case "unblock"               -> updateAccountStatus(uid, AccountStatus.ACTIVE, "USER_UNBLOCK");
                    case "verify_email" -> {
                        userRepository.findById(uid).ifPresent(u -> {
                            u.setEmailVerified(true);
                            u.setVerificationToken(null);
                            u.setAccountStatus(AccountStatus.ACTIVE);
                            u.setUpdatedAt(LocalDateTime.now());
                            userRepository.save(u);
                        });
                    }
                    case "assign_role" -> {
                        if (roleValue != null) {
                            Role r = Role.fromString(roleValue);
                            userRepository.findById(uid).ifPresent(u -> {
                                u.setRole(r);
                                u.setUpdatedAt(LocalDateTime.now());
                                userRepository.save(u);
                            });
                        }
                    }
                    case "assign_organization" -> {
                        if (targetId != null) assignUserToOrganization(uid, targetId);
                    }
                    case "assign_team" -> {
                        if (targetId != null) assignUserToTeam(uid, targetId);
                    }
                    case "assign_department" -> {
                        if (targetId != null) assignUserToDepartment(uid, targetId);
                    }
                }
                auditLogService.logAction("BULK_" + action.toUpperCase(), actor.getEmail(), uid, "USER",
                        "Bulk action '" + action + "' applied to user: " + uid);
                success++;
            } catch (Exception e) {
                logError("Bulk action failed for user " + uid, e);
                failed++;
            }
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("processed", userIds.size());
        result.put("success", success);
        result.put("failed", failed);
        return result;
    }

    /** Force-verify a user's email address and activate their account. */
    public User verifyUserEmail(String userId) {
        validateAdminOrSuperAdmin();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        if (user.getAccountStatus() == AccountStatus.PENDING_VERIFICATION) {
            user.setAccountStatus(AccountStatus.ACTIVE);
        }
        user.setUpdatedAt(LocalDateTime.now());
        User saved = userRepository.save(user);
        User actor = getCurrentUser();
        auditLogService.logAction("USER_VERIFY_EMAIL", actor.getEmail(), userId, "USER",
                "Admin verified email for: " + saved.getEmail());
        return saved;
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

    public User createUser(User userDetails) {
        validateAdminOrSuperAdmin();
        if (userRepository.existsByEmail(userDetails.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (userRepository.existsByUsername(userDetails.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        
        // Ensure some defaults
        userDetails.setCreatedAt(LocalDateTime.now());
        if (userDetails.getAccountStatus() == null) {
            userDetails.setAccountStatus(AccountStatus.ACTIVE);
            userDetails.setEmailVerified(true);
        }
        if (userDetails.getRole() == null) {
            userDetails.setRole(Role.MEMBER);
        }
        
        User saved = userRepository.save(userDetails);
        
        User actor = getCurrentUser();
        auditLogService.logAction(
                "USER_CREATE",
                actor.getEmail(),
                saved.getId(),
                "USER",
                "Admin created user: " + saved.getEmail()
        );
        return saved;
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

    // ─── Assignment Helpers ───────────────────────────────────────────────────

    /** Assign an existing user to an organization as MEMBER if not already a member. */
    public void assignUserToOrganization(String userId, String organizationId) {
        validateAdminOrSuperAdmin();
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found: " + organizationId));
        List<OrganizationMember> existing = organizationMemberRepository.findByUserId(userId);
        boolean alreadyMember = existing.stream().anyMatch(m -> organizationId.equals(m.getOrganizationId()));
        if (!alreadyMember) {
            OrganizationMember member = OrganizationMember.builder()
                    .userId(userId)
                    .organizationId(organizationId)
                    .role(OrganizationRole.MEMBER)
                    .joinedAt(LocalDateTime.now())
                    .build();
            organizationMemberRepository.save(member);
        }
        User actor = getCurrentUser();
        auditLogService.logAction("USER_ASSIGN_ORG", actor.getEmail(), userId, "USER",
                "Assigned user " + userId + " to organization " + organizationId);
    }

    /** Assign a user to a team, creating a TeamMember record if not already there. */
    public void assignUserToTeam(String userId, String teamId) {
        validateAdminOrSuperAdmin();
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found: " + teamId));
        List<TeamMember> existing = teamMemberRepository.findByUserId(userId);
        boolean alreadyMember = existing.stream().anyMatch(m -> teamId.equals(m.getTeamId()));
        if (!alreadyMember) {
            TeamMember tm = TeamMember.builder()
                    .userId(userId)
                    .teamId(teamId)
                    .joinedAt(LocalDateTime.now())
                    .build();
            teamMemberRepository.save(tm);
        }
        User actor = getCurrentUser();
        auditLogService.logAction("USER_ASSIGN_TEAM", actor.getEmail(), userId, "USER",
                "Assigned user " + userId + " to team " + teamId);
    }

    /** Assign a user to a department by adding their ID to departmentMemberIds. */
    public void assignUserToDepartment(String userId, String departmentId) {
        validateAdminOrSuperAdmin();
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        Department dept = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found: " + departmentId));
        if (dept.getMemberIds() == null) dept.setMemberIds(new ArrayList<>());
        if (!dept.getMemberIds().contains(userId)) {
            dept.getMemberIds().add(userId);
            departmentRepository.save(dept);
        }
        User actor = getCurrentUser();
        auditLogService.logAction("USER_ASSIGN_DEPT", actor.getEmail(), userId, "USER",
                "Assigned user " + userId + " to department " + departmentId);
    }

    // ─── Admin Reset Password ─────────────────────────────────────────────────

    /** Super Admin can force-reset any user's password. */
    public void adminResetPassword(String userId, String newPassword) {
        validateSuperAdmin();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        user.setPassword(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        User actor = getCurrentUser();
        auditLogService.logAction("USER_PASSWORD_RESET", actor.getEmail(), userId, "USER",
                "Admin reset password for user: " + user.getEmail());
    }

    // ─── Login History ────────────────────────────────────────────────────────

    public List<LoginHistory> getUserLoginHistory(String userId) {
        validateAdminOrSuperAdmin();
        return loginHistoryRepository.findByUserId(userId);
    }

    // ─── CSV Export ───────────────────────────────────────────────────────────

    /** Export all (optionally filtered) users as CSV string. */
    public String exportUsersCsv(String search, String role, String status) {
        List<User> users = getAllUsers(search, role, status, "fullName", "asc", null, null, null, null);
        StringBuilder sb = new StringBuilder();
        sb.append("Id,FullName,Email,Username,Role,Status,EmailVerified,Organization,Department,Team,CreatedAt,LastLoginAt\n");
        for (User u : users) {
            sb.append(csvField(u.getId())).append(',');
            sb.append(csvField(u.getFullName())).append(',');
            sb.append(csvField(u.getEmail())).append(',');
            sb.append(csvField(u.getUsername())).append(',');
            sb.append(csvField(u.getRole() != null ? u.getRole().name() : "")).append(',');
            sb.append(csvField(u.getAccountStatus() != null ? u.getAccountStatus().name() : "")).append(',');
            sb.append(u.isEmailVerified()).append(',');
            sb.append(csvField(u.getOrganizationName())).append(',');
            sb.append(csvField(u.getDepartmentName())).append(',');
            sb.append(csvField(u.getTeamName())).append(',');
            sb.append(csvField(u.getCreatedAt() != null ? u.getCreatedAt().toString() : "")).append(',');
            sb.append(csvField(u.getLastLoginAt() != null ? u.getLastLoginAt().toString() : "")).append('\n');
        }
        return sb.toString();
    }

    private String csvField(String val) {
        if (val == null) return "";
        if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
            return "\"" + val.replace("\"", "\"\"") + "\"";
        }
        return val;
    }
}
