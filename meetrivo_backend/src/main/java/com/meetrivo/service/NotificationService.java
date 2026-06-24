package com.meetrivo.service;

import com.meetrivo.model.Notification;
import com.meetrivo.model.NotificationType;
import com.meetrivo.model.User;
import com.meetrivo.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService extends BaseService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @CacheEvict(value = "notifications", key = "#userId")
    public Notification createNotification(String userId, String title, String message, NotificationType type) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();
        
        Notification saved = notificationRepository.save(notification);
        
        // Broadcast via WebSocket for real-time delivery
        try {
            messagingTemplate.convertAndSend("/topic/notifications/" + userId, saved);
        } catch (Exception e) {
            logError("Failed to broadcast real-time notification", e);
        }
        
        logInfo("Notification created for user: " + userId + " - Title: " + title);
        return saved;
    }

    @CacheEvict(value = "notifications", key = "#result.userId")
    public Notification markAsRead(String id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + id));
        
        // Security check: validate Notification Ownership
        User user = getCurrentUser();
        if (!notification.getUserId().equals(user.getId())) {
            throw new RuntimeException("Access denied: You do not own this notification");
        }
        
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    @CacheEvict(value = "notifications", allEntries = true)
    public void markAllAsRead() {
        User user = getCurrentUser();
        List<Notification> unread = notificationRepository.findByUserIdAndReadOrderByCreatedAtDesc(user.getId(), false);
        for (Notification notification : unread) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    public List<Notification> getNotifications() {
        User user = getCurrentUser();
        return getNotificationsForUser(user.getId());
    }

    @Cacheable(value = "notifications", key = "#userId")
    public List<Notification> getNotificationsForUser(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
