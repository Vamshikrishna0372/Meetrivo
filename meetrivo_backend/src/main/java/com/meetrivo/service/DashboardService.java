package com.meetrivo.service;

import com.meetrivo.dto.DashboardResponse;
import com.meetrivo.model.Notification;
import com.meetrivo.model.ScheduledMeeting;
import com.meetrivo.model.User;
import com.meetrivo.repository.NotificationRepository;
import com.meetrivo.repository.ScheduledMeetingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService extends BaseService {

    private final ScheduledMeetingRepository scheduledMeetingRepository;
    private final NotificationRepository notificationRepository;

    /**
     * Returns a consolidated dashboard view: upcoming meetings, recent past
     * meetings, and the latest unread notifications for the authenticated user.
     */
    public DashboardResponse getDashboard() {
        User user = getCurrentUser();

        // Upcoming meetings — starts in the future, ordered ASC
        List<ScheduledMeeting> upcoming = scheduledMeetingRepository
                .findByHostIdAndStartTimeAfterOrderByStartTimeAsc(user.getId(), LocalDateTime.now());

        // Recent meetings — started in the past, ordered DESC, cap at 10
        List<ScheduledMeeting> recent = scheduledMeetingRepository
                .findByHostIdAndStartTimeBeforeOrderByStartTimeDesc(user.getId(), LocalDateTime.now())
                .stream()
                .limit(10)
                .collect(Collectors.toList());

        // Notifications — all for user ordered by createdAt DESC, cap at 20
        List<Notification> notifications = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .limit(20)
                .collect(Collectors.toList());

        long unreadCount = notificationRepository.countByUserIdAndReadFalse(user.getId());

        logInfo("Dashboard fetched for user: " + user.getId());

        return DashboardResponse.builder()
                .upcomingMeetings(upcoming)
                .recentMeetings(recent)
                .recentNotifications(notifications)
                .unreadNotificationsCount(unreadCount)
                .totalUpcomingMeetings(upcoming.size())
                .build();
    }

    public List<ScheduledMeeting> getUpcomingMeetings() {
        User user = getCurrentUser();
        return scheduledMeetingRepository
                .findByHostIdAndStartTimeAfterOrderByStartTimeAsc(user.getId(), LocalDateTime.now());
    }

    public List<ScheduledMeeting> getRecentMeetings() {
        User user = getCurrentUser();
        return scheduledMeetingRepository
                .findByHostIdAndStartTimeBeforeOrderByStartTimeDesc(user.getId(), LocalDateTime.now())
                .stream()
                .limit(10)
                .collect(Collectors.toList());
    }

    public List<Notification> getDashboardNotifications() {
        User user = getCurrentUser();
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .limit(20)
                .collect(Collectors.toList());
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
