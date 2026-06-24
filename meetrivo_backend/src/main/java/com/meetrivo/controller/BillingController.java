package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.model.SubscriptionPlan;
import com.meetrivo.model.User;
import com.meetrivo.model.UserSubscription;
import com.meetrivo.service.BillingService;
import com.meetrivo.service.SubscriptionSecurityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
@Tag(name = "Billing", description = "Subscription plan management and billing lifecycle endpoints")
public class BillingController {

    private final BillingService billingService;
    private final SubscriptionSecurityService subscriptionSecurityService;

    // ─── Get All Active Plans ─────────────────────────────────────────────────

    @GetMapping("/plans")
    @Operation(
        summary = "Get Subscription Plans",
        description = "Returns all active subscription plans available to users (FREE, PRO, BUSINESS, ENTERPRISE)."
    )
    public ApiResponse<List<SubscriptionPlan>> getActivePlans() {
        List<SubscriptionPlan> plans = billingService.getActivePlans();
        return ApiResponse.success(plans, "Active subscription plans retrieved successfully");
    }

    // ─── Get Specific Plan ────────────────────────────────────────────────────

    @GetMapping("/plans/{planId}")
    @Operation(
        summary = "Get Plan Details",
        description = "Returns details for a specific subscription plan by ID."
    )
    public ApiResponse<SubscriptionPlan> getPlan(
            @Parameter(description = "Subscription plan ID") @PathVariable String planId) {
        SubscriptionPlan plan = billingService.getPlan(planId);
        return ApiResponse.success(plan, "Subscription plan retrieved successfully");
    }

    // ─── Subscribe to Plan ────────────────────────────────────────────────────

    @PostMapping("/subscribe")
    @Operation(
        summary = "Subscribe to Plan",
        description = "Creates a new subscription for the authenticated user to the specified plan. " +
                      "Subscription status starts as PENDING until payment is verified."
    )
    public ApiResponse<UserSubscription> subscribe(
            @AuthenticationPrincipal User currentUser,
            @RequestBody Map<String, String> request) {
        String planId = request.get("planId");
        if (planId == null || planId.isBlank()) {
            return ApiResponse.error("planId is required");
        }
        subscriptionSecurityService.validatePlanAccess(currentUser.getId(), planId);
        UserSubscription subscription = billingService.createSubscription(currentUser.getId(), planId);
        return ApiResponse.success(subscription, "Subscription created successfully. Complete payment to activate.");
    }

    // ─── Upgrade Plan ─────────────────────────────────────────────────────────

    @PutMapping("/upgrade")
    @Operation(
        summary = "Upgrade Subscription Plan",
        description = "Upgrades the authenticated user's current subscription to a higher-tier plan."
    )
    public ApiResponse<UserSubscription> upgrade(
            @AuthenticationPrincipal User currentUser,
            @RequestBody Map<String, String> request) {
        String newPlanId = request.get("planId");
        if (newPlanId == null || newPlanId.isBlank()) {
            return ApiResponse.error("planId is required");
        }
        subscriptionSecurityService.validatePlanAccess(currentUser.getId(), newPlanId);
        UserSubscription subscription = billingService.upgradePlan(currentUser.getId(), newPlanId);
        return ApiResponse.success(subscription, "Subscription upgrade initiated. Complete payment to activate.");
    }

    // ─── Downgrade Plan ───────────────────────────────────────────────────────

    @PutMapping("/downgrade")
    @Operation(
        summary = "Downgrade Subscription Plan",
        description = "Downgrades the authenticated user's subscription to a lower-tier plan, effective at the next billing cycle."
    )
    public ApiResponse<UserSubscription> downgrade(
            @AuthenticationPrincipal User currentUser,
            @RequestBody Map<String, String> request) {
        String newPlanId = request.get("planId");
        if (newPlanId == null || newPlanId.isBlank()) {
            return ApiResponse.error("planId is required");
        }
        subscriptionSecurityService.validatePlanAccess(currentUser.getId(), newPlanId);
        UserSubscription subscription = billingService.downgradePlan(currentUser.getId(), newPlanId);
        return ApiResponse.success(subscription, "Subscription downgraded successfully. Effective at next billing cycle.");
    }

    // ─── Cancel Subscription ──────────────────────────────────────────────────

    @DeleteMapping("/cancel")
    @Operation(
        summary = "Cancel Subscription",
        description = "Cancels the authenticated user's active subscription. Access requires billing ownership."
    )
    public ApiResponse<UserSubscription> cancel(@AuthenticationPrincipal User currentUser) {
        subscriptionSecurityService.validateBillingOwnership(currentUser.getId());
        UserSubscription subscription = billingService.cancelSubscription(currentUser.getId());
        return ApiResponse.success(subscription, "Subscription cancelled successfully");
    }

    // ─── Get Current Subscription ─────────────────────────────────────────────

    @GetMapping("/subscription")
    @Operation(
        summary = "Get Current Subscription",
        description = "Returns the authenticated user's active subscription details."
    )
    public ApiResponse<UserSubscription> getSubscription(@AuthenticationPrincipal User currentUser) {
        UserSubscription subscription = billingService.getSubscription(currentUser.getId());
        return ApiResponse.success(subscription, "Subscription retrieved successfully");
    }

    // ─── Renew Subscription ───────────────────────────────────────────────────

    @PostMapping("/renew")
    @Operation(
        summary = "Renew Subscription",
        description = "Manually renews the authenticated user's subscription for another billing cycle."
    )
    public ApiResponse<UserSubscription> renew(@AuthenticationPrincipal User currentUser) {
        subscriptionSecurityService.validateBillingOwnership(currentUser.getId());
        UserSubscription subscription = billingService.renewSubscription(currentUser.getId());
        return ApiResponse.success(subscription, "Subscription renewed successfully");
    }
}
