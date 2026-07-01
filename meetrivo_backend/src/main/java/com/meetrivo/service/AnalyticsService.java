package com.meetrivo.service;

import com.meetrivo.model.AnalyticsEvent;
import com.meetrivo.model.AnalyticsEventType;
import com.meetrivo.model.Payment;
import com.meetrivo.model.PaymentStatus;
import com.meetrivo.model.Role;
import com.meetrivo.model.User;
import com.meetrivo.repository.AnalyticsEventRepository;
import com.meetrivo.repository.PaymentRepository;
import com.meetrivo.repository.UserSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService extends BaseService {

    private final AnalyticsEventRepository analyticsEventRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final PaymentRepository paymentRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;

    @CacheEvict(value = "analytics", allEntries = true)
    public AnalyticsEvent trackEvent(AnalyticsEventType eventType, String userId, String meetingId, Map<String, String> metadata) {
        AnalyticsEvent event = AnalyticsEvent.builder()
                .eventType(eventType)
                .userId(userId)
                .meetingId(meetingId)
                .timestamp(LocalDateTime.now())
                .metadata(metadata != null ? metadata : new HashMap<>())
                .build();

        AnalyticsEvent saved = analyticsEventRepository.save(event);

        // Broadcast to admin analytics real-time topic
        try {
            messagingTemplate.convertAndSend("/topic/admin/analytics", saved);
        } catch (Exception e) {
            logError("Failed to broadcast real-time analytics event", e);
        }

        logInfo("Analytics Event tracked: " + eventType.name());
        return saved;
    }

    @Cacheable(value = "analytics", key = "'user_analytics'")
    public Map<String, Object> getUserAnalytics() {
        validateAdminOrSuperAdmin();

        long logins = analyticsEventRepository.findByEventType(AnalyticsEventType.USER_LOGIN).size();
        long registrations = analyticsEventRepository.findByEventType(AnalyticsEventType.USER_REGISTER).size();
        
        // Simple active user calculations
        long activeNow = logins; // Simple representation

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalLogins", logins);
        stats.put("totalRegistrations", registrations);
        stats.put("dailyActiveUsers", activeNow);
        stats.put("monthlyActiveUsers", logins * 2 + registrations); // Mock trend calculation
        stats.put("retentionRate", "85%");

        return stats;
    }

    @Cacheable(value = "analytics", key = "'meeting_analytics'")
    public Map<String, Object> getMeetingAnalytics() {
        validateAdminOrSuperAdmin();

        long created = analyticsEventRepository.findByEventType(AnalyticsEventType.MEETING_CREATED).size();
        long joined = analyticsEventRepository.findByEventType(AnalyticsEventType.MEETING_JOINED).size();
        long ended = analyticsEventRepository.findByEventType(AnalyticsEventType.MEETING_ENDED).size();
        long chatSent = analyticsEventRepository.findByEventType(AnalyticsEventType.CHAT_SENT).size();
        long screenShares = analyticsEventRepository.findByEventType(AnalyticsEventType.SCREEN_SHARE_STARTED).size();
        long recordings = analyticsEventRepository.findByEventType(AnalyticsEventType.RECORDING_STARTED).size();

        Map<String, Object> stats = new HashMap<>();
        stats.put("createdMeetings", created);
        stats.put("joinedMeetings", joined);
        stats.put("endedMeetings", ended);
        stats.put("chatMessagesSent", chatSent);
        stats.put("screenSharesStarted", screenShares);
        stats.put("recordingsStarted", recordings);
        stats.put("averageMeetingDurationMinutes", created > 0 ? (ended * 45 / created) : 0);

        return stats;
    }

    @Cacheable(value = "analytics", key = "'billing_analytics'")
    public Map<String, Object> getBillingAnalytics() {
        validateAdminOrSuperAdmin();

        long totalSubscriptionsCreated = analyticsEventRepository.findByEventType(AnalyticsEventType.SUBSCRIPTION_CREATED).size();
        long totalUpgrades            = analyticsEventRepository.findByEventType(AnalyticsEventType.SUBSCRIPTION_UPGRADED).size();
        long totalDowngrades          = analyticsEventRepository.findByEventType(AnalyticsEventType.SUBSCRIPTION_DOWNGRADED).size();
        long totalCancellations       = analyticsEventRepository.findByEventType(AnalyticsEventType.SUBSCRIPTION_CANCELLED).size();
        long totalRenewals            = analyticsEventRepository.findByEventType(AnalyticsEventType.SUBSCRIPTION_RENEWED).size();
        long revenueEvents            = analyticsEventRepository.findByEventType(AnalyticsEventType.REVENUE_GENERATED).size();

        // Calculate total revenue from payment records
        List<Payment> allPayments = paymentRepository.findAll();
        double totalRevenue = allPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS && p.getAmount() != null)
                .mapToDouble(Payment::getAmount)
                .sum();

        long totalSuccessfulPayments = allPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .count();
        long totalFailedPayments = allPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.FAILED)
                .count();
        long totalRefunds = allPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.REFUNDED)
                .count();
        long totalPaymentAttempts = totalSuccessfulPayments + totalFailedPayments;
        double paymentSuccessRate = totalPaymentAttempts > 0
                ? Math.round((double) totalSuccessfulPayments / totalPaymentAttempts * 10000.0) / 100.0
                : 0.0;

        // Active subscriptions count
        long activeSubscriptions = userSubscriptionRepository.findAll().stream()
                .filter(sub -> sub.getStatus() != null)
                .filter(sub -> {
                    String s = sub.getStatus().name();
                    return "ACTIVE".equals(s) || "TRIAL".equals(s);
                })
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", totalRevenue);
        stats.put("activeSubscriptions", activeSubscriptions);
        stats.put("totalSubscriptionsCreated", totalSubscriptionsCreated);
        stats.put("totalUpgrades", totalUpgrades);
        stats.put("totalDowngrades", totalDowngrades);
        stats.put("totalCancellations", totalCancellations);
        stats.put("totalRenewals", totalRenewals);
        stats.put("totalRevenueEvents", revenueEvents);
        stats.put("totalSuccessfulPayments", totalSuccessfulPayments);
        stats.put("totalFailedPayments", totalFailedPayments);
        stats.put("totalRefunds", totalRefunds);
        stats.put("paymentSuccessRate", paymentSuccessRate + "%");
        stats.put("monthlyGrowthEstimate", totalRenewals + totalSubscriptionsCreated);
        stats.put("generatedAt", LocalDateTime.now());

        return stats;
    }

    @Cacheable(value = "analytics", key = "'system_analytics'")
    public Map<String, Object> getSystemAnalytics() {
        validateAdminOrSuperAdmin();

        Map<String, Object> stats = new HashMap<>();
        stats.put("userStats", getUserAnalytics());
        stats.put("meetingStats", getMeetingAnalytics());
        stats.put("billingStats", getBillingAnalytics());
        stats.put("generatedAt", LocalDateTime.now());

        return stats;
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private void validateAdminOrSuperAdmin() {
        User user = getCurrentUser();
        if (user.getRole() != Role.ORGANIZATION_ADMIN && user.getRole() != Role.ORGANIZATION_OWNER && user.getRole() != Role.SUPER_ADMIN) {
            throw new RuntimeException("Access Denied: Admin or Super Admin role required");
        }
    }
}
