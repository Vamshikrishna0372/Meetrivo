package com.meetrivo.service;

import com.meetrivo.dto.UserResponse;
import com.meetrivo.model.User;
import com.meetrivo.repository.MeetingRepository;
import com.meetrivo.repository.OrganizationMemberRepository;
import com.meetrivo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService extends BaseService {

    private final UserRepository userRepository;
    private final com.meetrivo.repository.LoginHistoryRepository loginHistoryRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final MeetingRepository meetingRepository;
    private final OrganizationMemberRepository organizationMemberRepository;

    public UserResponse getProfile() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return mapToUserResponse(user);
    }

    public Map<String, Object> getUserStats() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        long totalMeetings = meetingRepository.findByHostId(user.getId()).size();
        long workspaces = organizationMemberRepository.findAll().stream()
            .filter(m -> user.getId().equals(m.getUserId())).count();
        // Estimate hours from meeting count (avg 45 min per meeting)
        long totalHours = (totalMeetings * 45) / 60;
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMeetings", totalMeetings);
        stats.put("totalHours", totalHours);
        stats.put("workspaces", workspaces);
        stats.put("meetingsThisWeek", Math.min(totalMeetings, 7));
        stats.put("avgDurationMin", totalMeetings > 0 ? 45 : 0);
        stats.put("totalParticipants", totalMeetings * 3);
        return stats;
    }
    @SuppressWarnings("unchecked")
    public UserResponse updateProfile(Map<String, Object> updates) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        if (updates.containsKey("fullName")) {
            user.setFullName((String) updates.get("fullName"));
        }
        if (updates.containsKey("bio")) {
            user.setBio((String) updates.get("bio"));
        }
        
        if (user.getPreferences() == null) {
            user.setPreferences(new com.meetrivo.model.UserPreferences());
        }
        
        if (updates.containsKey("language")) {
            user.getPreferences().setLanguage((String) updates.get("language"));
        }
        if (updates.containsKey("theme")) {
            user.getPreferences().setTheme((String) updates.get("theme"));
        }
        if (updates.containsKey("emailNotifications")) {
            user.getPreferences().setEmailNotifications((Boolean) updates.get("emailNotifications"));
        }
        if (updates.containsKey("pushNotifications")) {
            user.getPreferences().setPushNotifications((Boolean) updates.get("pushNotifications"));
        }
        if (updates.containsKey("timezone")) {
            user.getPreferences().setTimezone((String) updates.get("timezone"));
        }
        
        if (updates.containsKey("preferences")) {
            Map<String, Object> prefMap = (Map<String, Object>) updates.get("preferences");
            if (prefMap.containsKey("language")) {
                user.getPreferences().setLanguage((String) prefMap.get("language"));
            }
            if (prefMap.containsKey("theme")) {
                user.getPreferences().setTheme((String) prefMap.get("theme"));
            }
            if (prefMap.containsKey("emailNotifications")) {
                user.getPreferences().setEmailNotifications((Boolean) prefMap.get("emailNotifications"));
            }
            if (prefMap.containsKey("pushNotifications")) {
                user.getPreferences().setPushNotifications((Boolean) prefMap.get("pushNotifications"));
            }
            if (prefMap.containsKey("timezone")) {
                user.getPreferences().setTimezone((String) prefMap.get("timezone"));
            }
        }
        
        User updatedUser = userRepository.save(user);
        logInfo("User profile updated: " + user.getUsername());
        return mapToUserResponse(updatedUser);
    }

    public UserResponse updateProfilePicture(String url) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        user.setProfilePicture(url);
        User updatedUser = userRepository.save(user);
        logInfo("User profile picture updated: " + user.getUsername());
        return mapToUserResponse(updatedUser);
    }

    public void changePassword(String oldPassword, String newPassword) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Current password does not match");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(java.time.LocalDateTime.now());
        userRepository.save(user);
        logInfo("User changed password: " + user.getUsername());
    }

    public void deactivateAccount() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        user.setAccountStatus(com.meetrivo.model.AccountStatus.INACTIVE);
        user.setUpdatedAt(java.time.LocalDateTime.now());
        userRepository.save(user);
        logInfo("User deactivated account: " + user.getUsername());
    }

    public java.util.List<com.meetrivo.model.LoginHistory> getLoginHistory() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return loginHistoryRepository.findByUserId(user.getId());
    }

    public void recordLogin(String userId, String username, String ipAddress, String userAgent, String status) {
        com.meetrivo.model.LoginHistory history = com.meetrivo.model.LoginHistory.builder()
                .userId(userId)
                .username(username)
                .loginTime(java.time.LocalDateTime.now())
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .status(status)
                .build();
        loginHistoryRepository.save(history);
        logInfo("Recorded login history entry for user: " + username + " with status: " + status);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .profilePicture(user.getProfilePicture())
                .bio(user.getBio())
                .role(user.getRole())
                .accountStatus(user.getAccountStatus())
                .emailVerified(user.isEmailVerified())
                .preferences(user.getPreferences())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }
}
