package com.meetrivo.service;

import com.meetrivo.model.*;
import com.meetrivo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BillingService extends BaseService {

    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;
    private final AnalyticsService analyticsService;

    public UserSubscription createSubscription(String userId, String planId) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Subscription plan not found"));

        if (!plan.isActive()) {
            throw new RuntimeException("Subscription plan is not active");
        }

        // Cancel any existing subscription
        userSubscriptionRepository.findByUserId(userId).ifPresent(existing -> {
            if (existing.getStatus() == SubscriptionStatus.ACTIVE || existing.getStatus() == SubscriptionStatus.TRIAL) {
                existing.setStatus(SubscriptionStatus.CANCELLED);
                userSubscriptionRepository.save(existing);
            }
        });

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endDate = plan.getBillingCycle() == BillingCycle.YEARLY
                ? now.plusYears(1) : now.plusMonths(1);

        UserSubscription subscription = UserSubscription.builder()
                .userId(userId)
                .planId(planId)
                .status(SubscriptionStatus.PENDING) // Activated after payment verification
                .startDate(now)
                .endDate(endDate)
                .autoRenew(true)
                .createdAt(now)
                .build();

        UserSubscription saved = userSubscriptionRepository.save(subscription);
        analyticsService.trackEvent(AnalyticsEventType.SUBSCRIPTION_CREATED, userId, null, null);
        logInfo("Subscription created for user: " + userId + " with plan: " + plan.getName());
        return saved;
    }

    public UserSubscription upgradePlan(String userId, String newPlanId) {
        UserSubscription subscription = userSubscriptionRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("No active subscription found for user"));

        SubscriptionPlan newPlan = subscriptionPlanRepository.findById(newPlanId)
                .orElseThrow(() -> new RuntimeException("New subscription plan not found"));

        if (!newPlan.isActive()) {
            throw new RuntimeException("Target subscription plan is not active");
        }

        String oldPlanId = subscription.getPlanId();
        subscription.setPlanId(newPlanId);
        subscription.setStatus(SubscriptionStatus.PENDING); // Activated after payment
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endDate = newPlan.getBillingCycle() == BillingCycle.YEARLY
                ? now.plusYears(1) : now.plusMonths(1);
        subscription.setStartDate(now);
        subscription.setEndDate(endDate);

        UserSubscription saved = userSubscriptionRepository.save(subscription);
        analyticsService.trackEvent(AnalyticsEventType.SUBSCRIPTION_UPGRADED, userId, null, null);
        logInfo("Subscription upgraded for user: " + userId + " from plan: " + oldPlanId + " to: " + newPlanId);
        return saved;
    }

    public UserSubscription downgradePlan(String userId, String newPlanId) {
        UserSubscription subscription = userSubscriptionRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("No active subscription found for user"));

        SubscriptionPlan newPlan = subscriptionPlanRepository.findById(newPlanId)
                .orElseThrow(() -> new RuntimeException("New subscription plan not found"));

        if (!newPlan.isActive()) {
            throw new RuntimeException("Target subscription plan is not active");
        }

        String oldPlanId = subscription.getPlanId();
        subscription.setPlanId(newPlanId);
        // Downgrade takes effect at next billing cycle — keep endDate
        subscription.setStatus(SubscriptionStatus.ACTIVE);

        UserSubscription saved = userSubscriptionRepository.save(subscription);
        analyticsService.trackEvent(AnalyticsEventType.SUBSCRIPTION_DOWNGRADED, userId, null, null);
        logInfo("Subscription downgraded for user: " + userId + " from plan: " + oldPlanId + " to: " + newPlanId);
        return saved;
    }

    public UserSubscription cancelSubscription(String userId) {
        UserSubscription subscription = userSubscriptionRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("No subscription found for user"));

        if (subscription.getStatus() == SubscriptionStatus.CANCELLED) {
            throw new RuntimeException("Subscription is already cancelled");
        }

        subscription.setStatus(SubscriptionStatus.CANCELLED);
        subscription.setAutoRenew(false);

        UserSubscription saved = userSubscriptionRepository.save(subscription);
        analyticsService.trackEvent(AnalyticsEventType.SUBSCRIPTION_CANCELLED, userId, null, null);
        logInfo("Subscription cancelled for user: " + userId);
        return saved;
    }

    public UserSubscription renewSubscription(String userId) {
        UserSubscription subscription = userSubscriptionRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("No subscription found for user"));

        if (subscription.getStatus() == SubscriptionStatus.CANCELLED) {
            throw new RuntimeException("Cannot renew a cancelled subscription");
        }

        SubscriptionPlan plan = subscriptionPlanRepository.findById(subscription.getPlanId())
                .orElseThrow(() -> new RuntimeException("Subscription plan not found"));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endDate = plan.getBillingCycle() == BillingCycle.YEARLY
                ? now.plusYears(1) : now.plusMonths(1);
        subscription.setStartDate(now);
        subscription.setEndDate(endDate);
        subscription.setStatus(SubscriptionStatus.ACTIVE);

        UserSubscription saved = userSubscriptionRepository.save(subscription);
        analyticsService.trackEvent(AnalyticsEventType.SUBSCRIPTION_RENEWED, userId, null, null);
        logInfo("Subscription renewed for user: " + userId);
        return saved;
    }

    public UserSubscription getSubscription(String userId) {
        return userSubscriptionRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("No subscription found for user"));
    }

    public List<SubscriptionPlan> getActivePlans() {
        return subscriptionPlanRepository.findByActiveTrue();
    }

    public SubscriptionPlan getPlan(String planId) {
        return subscriptionPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Subscription plan not found"));
    }

    /**
     * Seed default plans if none exist. Called on application startup.
     */
    public void seedDefaultPlans() {
        if (subscriptionPlanRepository.count() == 0) {
            List<SubscriptionPlan> defaultPlans = Arrays.asList(
                SubscriptionPlan.builder()
                    .name("FREE")
                    .description("Basic free plan for personal use")
                    .price(0.0)
                    .currency("INR")
                    .billingCycle(BillingCycle.MONTHLY)
                    .meetingLimit(10)
                    .participantLimit(10)
                    .recordingLimit(2)
                    .storageLimit(1024L * 1024 * 1024) // 1 GB
                    .features(Arrays.asList("Basic Meetings", "Chat", "Screen Share"))
                    .active(true)
                    .build(),
                SubscriptionPlan.builder()
                    .name("PRO")
                    .description("Professional plan for power users")
                    .price(999.0)
                    .currency("INR")
                    .billingCycle(BillingCycle.MONTHLY)
                    .meetingLimit(100)
                    .participantLimit(50)
                    .recordingLimit(20)
                    .storageLimit(10L * 1024 * 1024 * 1024) // 10 GB
                    .features(Arrays.asList("All Free Features", "AI Assistant", "Advanced Analytics", "Extended Recording"))
                    .active(true)
                    .build(),
                SubscriptionPlan.builder()
                    .name("BUSINESS")
                    .description("Business plan for teams and organizations")
                    .price(2999.0)
                    .currency("INR")
                    .billingCycle(BillingCycle.MONTHLY)
                    .meetingLimit(500)
                    .participantLimit(200)
                    .recordingLimit(100)
                    .storageLimit(50L * 1024 * 1024 * 1024) // 50 GB
                    .features(Arrays.asList("All Pro Features", "Organization Management", "Team Features", "Premium Whiteboard", "Large Meetings"))
                    .active(true)
                    .build(),
                SubscriptionPlan.builder()
                    .name("ENTERPRISE")
                    .description("Enterprise plan with unlimited access")
                    .price(9999.0)
                    .currency("INR")
                    .billingCycle(BillingCycle.MONTHLY)
                    .meetingLimit(-1) // unlimited
                    .participantLimit(-1) // unlimited
                    .recordingLimit(-1) // unlimited
                    .storageLimit(-1L) // unlimited
                    .features(Arrays.asList("All Business Features", "Custom Integrations", "SLA Support", "White-label", "Dedicated CSM"))
                    .active(true)
                    .build()
            );
            subscriptionPlanRepository.saveAll(defaultPlans);
            logInfo("Default subscription plans seeded successfully");
        }
    }
}
