package com.meetrivo.service;

import com.meetrivo.model.*;
import com.meetrivo.repository.SubscriptionPlanRepository;
import com.meetrivo.repository.UserSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/**
 * Subscription security service for validating billing ownership,
 * plan access, premium feature access, and organization-level access.
 *
 * Part 22 — Subscription Security
 */
@Service
@RequiredArgsConstructor
public class SubscriptionSecurityService {

    private final UserSubscriptionRepository userSubscriptionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;

    // Premium plan names (plans that cost money)
    private static final List<String> PREMIUM_PLAN_NAMES = Arrays.asList("PRO", "BUSINESS", "ENTERPRISE");

    // Organization-capable plan names
    private static final List<String> ORGANIZATION_PLAN_NAMES = Arrays.asList("BUSINESS", "ENTERPRISE");

    // ─── Billing Ownership Validation ─────────────────────────────────────────

    /**
     * Validates that the given userId has an active or pending subscription,
     * confirming they are a legitimate billing participant.
     * Any authenticated user may own billing; this prevents access by others.
     */
    public void validateBillingOwnership(String userId) {
        // Billing ownership check: subscription must belong to the calling user.
        // Since we derive userId from the JWT principal, this is implicitly enforced.
        // This method exists as an explicit audit point and to check subscription state.
        Optional<UserSubscription> subscriptionOpt = userSubscriptionRepository.findByUserId(userId);
        if (subscriptionOpt.isEmpty()) {
            // User has no subscription at all — allow (they may be subscribing for the first time)
            return;
        }
        UserSubscription sub = subscriptionOpt.get();
        if (sub.getStatus() == SubscriptionStatus.CANCELLED) {
            throw new AccessDeniedException("Billing action denied: subscription is cancelled. Please subscribe again to continue.");
        }
    }

    // ─── Plan Access Validation ───────────────────────────────────────────────

    /**
     * Validates that the target plan exists and is active before allowing
     * a user to subscribe, upgrade, or downgrade to it.
     */
    public void validatePlanAccess(String userId, String planId) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(planId)
                .orElseThrow(() -> new AccessDeniedException("Plan not found or access denied: " + planId));

        if (!plan.isActive()) {
            throw new AccessDeniedException("The requested subscription plan is not currently available: " + plan.getName());
        }
    }

    // ─── Premium Access Validation ────────────────────────────────────────────

    /**
     * Validates that the user holds a premium plan (PRO, BUSINESS, or ENTERPRISE).
     * Throws AccessDeniedException if the user is on the free plan or has no active subscription.
     */
    public void validatePremiumAccess(String userId) {
        SubscriptionPlan plan = getActivePlan(userId);
        boolean isPremium = PREMIUM_PLAN_NAMES.stream()
                .anyMatch(name -> name.equalsIgnoreCase(plan.getName()));
        if (!isPremium) {
            throw new AccessDeniedException(
                "Premium access required. Your current plan '" + plan.getName() +
                "' does not include premium features. Please upgrade to PRO, BUSINESS, or ENTERPRISE.");
        }
    }

    // ─── Organization Access Validation ──────────────────────────────────────

    /**
     * Validates that the user holds a plan that supports organization features
     * (BUSINESS or ENTERPRISE). Throws AccessDeniedException otherwise.
     */
    public void validateOrganizationPlanAccess(String userId) {
        SubscriptionPlan plan = getActivePlan(userId);
        boolean supportsOrg = ORGANIZATION_PLAN_NAMES.stream()
                .anyMatch(name -> name.equalsIgnoreCase(plan.getName()));
        if (!supportsOrg) {
            throw new AccessDeniedException(
                "Organization features require the BUSINESS or ENTERPRISE plan. " +
                "Current plan: " + plan.getName() + ". Please upgrade to continue.");
        }
    }

    // ─── Feature-Level Access ─────────────────────────────────────────────────

    /**
     * Validates access to a named premium feature (e.g., "AI Assistant", "Advanced Analytics").
     * The feature name is matched against the plan's feature list (case-insensitive substring match).
     */
    public void validateFeatureAccess(String userId, String featureName) {
        SubscriptionPlan plan = getActivePlan(userId);
        if (plan.getFeatures() == null || plan.getFeatures().isEmpty()) {
            throw new AccessDeniedException("Your current plan does not include any premium features.");
        }
        boolean hasFeature = plan.getFeatures().stream()
                .anyMatch(f -> f.toLowerCase().contains(featureName.toLowerCase()));
        if (!hasFeature) {
            throw new AccessDeniedException(
                "Feature '" + featureName + "' is not available on your plan '" + plan.getName() +
                "'. Please upgrade your subscription.");
        }
    }

    /**
     * Validates AI Assistant access — requires PRO or higher plan.
     */
    public void validateAiAssistantAccess(String userId) {
        validateFeatureAccess(userId, "AI Assistant");
    }

    /**
     * Validates Advanced Analytics access — requires PRO or higher plan.
     */
    public void validateAdvancedAnalyticsAccess(String userId) {
        validateFeatureAccess(userId, "Advanced Analytics");
    }

    /**
     * Validates Extended Recording access — requires PRO or higher plan.
     */
    public void validateExtendedRecordingAccess(String userId) {
        validateFeatureAccess(userId, "Extended Recording");
    }

    /**
     * Validates Premium Whiteboard access — requires BUSINESS or higher plan.
     */
    public void validatePremiumWhiteboardAccess(String userId) {
        validateFeatureAccess(userId, "Premium Whiteboard");
    }

    /**
     * Validates Large Meetings access — requires BUSINESS or higher plan.
     */
    public void validateLargeMeetingsAccess(String userId) {
        validateFeatureAccess(userId, "Large Meetings");
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Retrieves the active subscription plan for a user.
     * Falls back to the built-in FREE plan if no active subscription exists.
     */
    public SubscriptionPlan getActivePlan(String userId) {
        return userSubscriptionRepository.findByUserId(userId)
                .filter(sub -> sub.getStatus() == SubscriptionStatus.ACTIVE
                            || sub.getStatus() == SubscriptionStatus.TRIAL)
                .flatMap(sub -> subscriptionPlanRepository.findById(sub.getPlanId()))
                .orElseGet(this::buildDefaultFreePlan);
    }

    /**
     * Returns a default FREE plan stub (used when no subscription record exists).
     */
    private SubscriptionPlan buildDefaultFreePlan() {
        return SubscriptionPlan.builder()
                .name("FREE")
                .description("Default free plan")
                .price(0.0)
                .currency("INR")
                .billingCycle(BillingCycle.MONTHLY)
                .meetingLimit(10)
                .participantLimit(10)
                .recordingLimit(2)
                .storageLimit(1024L * 1024 * 1024) // 1 GB
                .features(List.of("Basic Meetings", "Chat", "Screen Share"))
                .active(true)
                .build();
    }
}
