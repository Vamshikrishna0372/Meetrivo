package com.meetrivo.service;

import com.meetrivo.model.*;
import com.meetrivo.repository.MeetingRecordingRepository;
import com.meetrivo.repository.MeetingRepository;
import com.meetrivo.repository.SubscriptionPlanRepository;
import com.meetrivo.repository.UserSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Enforces subscription-based usage limits:
 * meetings, recordings, storage, participants, and premium features.
 */
@Service
@RequiredArgsConstructor
public class UsageLimitService extends BaseService {

    private final UserSubscriptionRepository userSubscriptionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final MeetingRepository meetingRepository;
    private final MeetingRecordingRepository meetingRecordingRepository;

    private SubscriptionPlan getUserPlan(String userId) {
        return userSubscriptionRepository.findByUserId(userId)
                .filter(sub -> sub.getStatus() == SubscriptionStatus.ACTIVE || sub.getStatus() == SubscriptionStatus.TRIAL)
                .flatMap(sub -> subscriptionPlanRepository.findById(sub.getPlanId()))
                .orElse(buildFreePlan());
    }

    private SubscriptionPlan buildFreePlan() {
        return SubscriptionPlan.builder()
                .name("FREE")
                .meetingLimit(10)
                .participantLimit(10)
                .recordingLimit(2)
                .storageLimit(1024L * 1024 * 1024)
                .active(true)
                .build();
    }

    /**
     * Check if user can create more meetings.
     */
    public void validateMeetingLimit(String userId) {
        SubscriptionPlan plan = getUserPlan(userId);
        if (plan.getMeetingLimit() == -1) return; // unlimited

        long currentCount = meetingRepository.findByHostIdOrderByCreatedAtDesc(userId).size();
        if (currentCount >= plan.getMeetingLimit()) {
            throw new RuntimeException("Meeting limit reached. Your " + plan.getName() +
                    " plan allows up to " + plan.getMeetingLimit() + " meetings. Please upgrade your plan.");
        }
    }

    /**
     * Check if meeting can accept more participants.
     */
    public void validateParticipantLimit(String userId, int currentParticipants) {
        SubscriptionPlan plan = getUserPlan(userId);
        if (plan.getParticipantLimit() == -1) return; // unlimited

        if (currentParticipants >= plan.getParticipantLimit()) {
            throw new RuntimeException("Participant limit reached. Your " + plan.getName() +
                    " plan allows up to " + plan.getParticipantLimit() + " participants. Please upgrade your plan.");
        }
    }

    /**
     * Check if user can start a new recording.
     */
    public void validateRecordingLimit(String userId) {
        SubscriptionPlan plan = getUserPlan(userId);
        if (plan.getRecordingLimit() == -1) return; // unlimited

        long currentCount = meetingRecordingRepository.findByHostId(userId).size();
        if (currentCount >= plan.getRecordingLimit()) {
            throw new RuntimeException("Recording limit reached. Your " + plan.getName() +
                    " plan allows up to " + plan.getRecordingLimit() + " recordings. Please upgrade your plan.");
        }
    }

    /**
     * Check if user has sufficient storage for a new file.
     */
    public void validateStorageLimit(String userId, long fileSizeBytes) {
        SubscriptionPlan plan = getUserPlan(userId);
        if (plan.getStorageLimit() == -1) return; // unlimited

        long usedStorage = meetingRecordingRepository.findByHostId(userId).stream()
                .mapToLong(r -> r.getFileSize() != null ? r.getFileSize() : 0L)
                .sum();

        if (usedStorage + fileSizeBytes > plan.getStorageLimit()) {
            throw new RuntimeException("Storage limit exceeded. Your " + plan.getName() +
                    " plan allows " + (plan.getStorageLimit() / (1024 * 1024)) +
                    " MB of storage. Please upgrade your plan or delete old recordings.");
        }
    }

    /**
     * Validate access to a premium feature by name.
     */
    public void validatePremiumFeature(String userId, String featureName) {
        SubscriptionPlan plan = getUserPlan(userId);
        if (plan.getFeatures() == null || plan.getFeatures().isEmpty()) {
            throw new RuntimeException("Premium feature '" + featureName + "' is not available on your plan.");
        }

        boolean hasFeature = plan.getFeatures().stream()
                .anyMatch(f -> f.toLowerCase().contains(featureName.toLowerCase()));

        if (!hasFeature) {
            throw new RuntimeException("Premium feature '" + featureName + "' requires a higher plan. Current plan: " + plan.getName());
        }
    }

    /**
     * Check if the plan supports organizations.
     */
    public void validateOrganizationAccess(String userId) {
        SubscriptionPlan plan = getUserPlan(userId);
        boolean supportsOrg = plan.getFeatures() != null &&
                plan.getFeatures().stream().anyMatch(f ->
                        f.toLowerCase().contains("organization") || "BUSINESS".equalsIgnoreCase(plan.getName()) || "ENTERPRISE".equalsIgnoreCase(plan.getName()));
        if (!supportsOrg) {
            throw new RuntimeException("Organization features require the BUSINESS or ENTERPRISE plan. Current plan: " + plan.getName());
        }
    }

    /**
     * Check whether AI assistant is enabled on this plan.
     */
    public void validateAiAssistantAccess(String userId) {
        validatePremiumFeature(userId, "AI Assistant");
    }

    /**
     * Get the plan summary for a user.
     */
    public SubscriptionPlan getUserPlanDetails(String userId) {
        return getUserPlan(userId);
    }
}
