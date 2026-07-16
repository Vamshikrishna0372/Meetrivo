package com.meetrivo.service;

import com.meetrivo.dto.UserResponse;
import com.meetrivo.model.*;
import com.meetrivo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService extends BaseService {

    private final UserRepository userRepository;
    private final LoginHistoryRepository loginHistoryRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final MeetingRepository meetingRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final OrganizationRepository organizationRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamRepository teamRepository;
    private final DepartmentRepository departmentRepository;
    private final AuditLogRepository auditLogRepository;

    public UserResponse getProfile() {
        return mapToUserResponse(currentUser());
    }

    public Map<String, Object> getUserStats() {
        User user = currentUser();
        List<Meeting> meetings = meetingRepository.findByHostId(user.getId());
        long totalMeetings = meetings.size();

        long totalMinutes = meetings.stream()
                .filter(m -> m.getActualStartTime() != null && m.getActualEndTime() != null)
                .mapToLong(m -> java.time.Duration.between(m.getActualStartTime(), m.getActualEndTime()).toMinutes())
                .sum();

        long totalHours = totalMinutes / 60;
        long avgDurationMin = totalMeetings > 0 ? totalMinutes / totalMeetings : 0;
        long workspaces = organizationMemberRepository.findByUserId(user.getId()).size();
        long meetingsThisWeek = meetings.stream()
                .filter(m -> m.getCreatedAt() != null && m.getCreatedAt().isAfter(LocalDateTime.now().minusDays(7)))
                .count();
        long totalParticipants = meetings.stream().mapToLong(Meeting::getParticipantCount).sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMeetings", totalMeetings);
        stats.put("totalHours", totalHours);
        stats.put("totalMinutes", totalMinutes);
        stats.put("workspaces", workspaces);
        stats.put("meetingsThisWeek", meetingsThisWeek);
        stats.put("avgDurationMin", avgDurationMin);
        stats.put("totalParticipants", totalParticipants);
        return stats;
    }

    @SuppressWarnings("unchecked")
    public UserResponse updateProfile(Map<String, Object> updates) {
        User user = currentUser();

        if (updates.containsKey("fullName"))   user.setFullName((String) updates.get("fullName"));
        if (updates.containsKey("bio"))        user.setBio((String) updates.get("bio"));
        if (updates.containsKey("phone"))      user.setPhone((String) updates.get("phone"));
        if (updates.containsKey("timezone"))   user.setTimezone((String) updates.get("timezone"));
        if (updates.containsKey("country"))    user.setCountry((String) updates.get("country"));
        if (updates.containsKey("language"))   user.setLanguage((String) updates.get("language"));

        if (user.getPreferences() == null) user.setPreferences(new UserPreferences());

        if (updates.containsKey("language"))           user.getPreferences().setLanguage((String) updates.get("language"));
        if (updates.containsKey("theme"))              user.getPreferences().setTheme((String) updates.get("theme"));
        if (updates.containsKey("emailNotifications")) user.getPreferences().setEmailNotifications((Boolean) updates.get("emailNotifications"));
        if (updates.containsKey("pushNotifications"))  user.getPreferences().setPushNotifications((Boolean) updates.get("pushNotifications"));
        if (updates.containsKey("timezone"))           user.getPreferences().setTimezone((String) updates.get("timezone"));

        if (updates.containsKey("preferences")) {
            Map<String, Object> p = (Map<String, Object>) updates.get("preferences");
            if (p.containsKey("language"))           user.getPreferences().setLanguage((String) p.get("language"));
            if (p.containsKey("theme"))              user.getPreferences().setTheme((String) p.get("theme"));
            if (p.containsKey("emailNotifications")) user.getPreferences().setEmailNotifications((Boolean) p.get("emailNotifications"));
            if (p.containsKey("pushNotifications"))  user.getPreferences().setPushNotifications((Boolean) p.get("pushNotifications"));
            if (p.containsKey("timezone"))           user.getPreferences().setTimezone((String) p.get("timezone"));
        }

        user.setUpdatedAt(LocalDateTime.now());
        User saved = userRepository.save(user);
        logInfo("User profile updated: " + user.getUsername());
        return mapToUserResponse(saved);
    }

    public UserResponse updateProfilePicture(String url) {
        User user = currentUser();
        user.setProfilePicture(url);
        user.setUpdatedAt(LocalDateTime.now());
        User saved = userRepository.save(user);
        logInfo("User profile picture updated: " + user.getUsername());
        return mapToUserResponse(saved);
    }

    public void changePassword(String oldPassword, String newPassword) {
        User user = currentUser();
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Current password does not match");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        logInfo("User changed password: " + user.getUsername());
    }

    public void deactivateAccount() {
        User user = currentUser();
        user.setAccountStatus(AccountStatus.INACTIVE);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        logInfo("User deactivated account: " + user.getUsername());
    }

    public List<LoginHistory> getLoginHistory() {
        return loginHistoryRepository.findByUserId(currentUser().getId());
    }

    public void recordLogin(String userId, String username, String ipAddress, String userAgent, String status) {
        loginHistoryRepository.save(LoginHistory.builder()
                .userId(userId).username(username)
                .loginTime(LocalDateTime.now())
                .ipAddress(ipAddress).userAgent(userAgent).status(status)
                .build());
        logInfo("Recorded login history entry for user: " + username + " status: " + status);
    }

    private User currentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public UserResponse mapToUserResponse(User user) {
        UserResponse.UserResponseBuilder b = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .profilePicture(user.getProfilePicture())
                .bio(user.getBio())
                .phone(user.getPhone())
                .timezone(user.getTimezone())
                .country(user.getCountry())
                .language(user.getLanguage())
                .role(user.getRole())
                .accountStatus(user.getAccountStatus())
                .emailVerified(user.isEmailVerified())
                .preferences(user.getPreferences())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastLoginAt(user.getLastLoginAt());

        // Organization membership
        if (user.getOrganizationId() != null) {
            b.organizationId(user.getOrganizationId()).organizationName(user.getOrganizationName());
        } else {
            List<OrganizationMember> ms = organizationMemberRepository.findByUserId(user.getId());
            if (ms != null && !ms.isEmpty()) {
                b.organizationId(ms.get(0).getOrganizationId());
                organizationRepository.findById(ms.get(0).getOrganizationId())
                        .ifPresent(org -> b.organizationName(org.getName()));
            }
        }

        // Team membership
        if (user.getTeamId() != null) {
            b.teamId(user.getTeamId()).teamName(user.getTeamName());
        } else {
            List<TeamMember> tms = teamMemberRepository.findByUserId(user.getId());
            if (tms != null && !tms.isEmpty()) {
                b.teamId(tms.get(0).getTeamId());
                teamRepository.findById(tms.get(0).getTeamId())
                        .ifPresent(t -> b.teamName(t.getName()));
            }
        }

        // Department membership
        if (user.getDepartmentId() != null) {
            b.departmentId(user.getDepartmentId()).departmentName(user.getDepartmentName());
        } else {
            departmentRepository.findAll().stream()
                    .filter(d -> d.getMemberIds() != null && d.getMemberIds().contains(user.getId()))
                    .findFirst()
                    .ifPresent(d -> b.departmentId(d.getId()).departmentName(d.getName()));
        }

        // Last activity
        if (user.getLastActivityAt() != null) {
            b.lastActivityAt(user.getLastActivityAt());
        } else if (user.getEmail() != null) {
            List<AuditLog> logs = auditLogRepository.findByPerformedByOrderByTimestampDesc(user.getEmail());
            if (logs != null && !logs.isEmpty()) b.lastActivityAt(logs.get(0).getTimestamp());
        }

        return b.build();
    }
}
