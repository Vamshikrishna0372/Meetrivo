package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.model.Payment;
import com.meetrivo.model.User;
import com.meetrivo.service.PaymentService;
import com.meetrivo.service.SubscriptionSecurityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment creation, verification, refund, and history endpoints (Razorpay primary)")
public class PaymentController {

    private final PaymentService paymentService;
    private final SubscriptionSecurityService subscriptionSecurityService;

    // ─── Create Payment ───────────────────────────────────────────────────────

    @PostMapping("/create")
    @Operation(
        summary = "Create Payment",
        description = "Initiates a Razorpay payment order for the specified subscription. Returns the Razorpay order details " +
                      "including orderId and keyId needed by the frontend Razorpay SDK."
    )
    public ApiResponse<Map<String, Object>> createPayment(
            @AuthenticationPrincipal User currentUser,
            @RequestBody Map<String, Object> request) {
        String subscriptionId = (String) request.get("subscriptionId");
        Double amount = request.get("amount") instanceof Number
                ? ((Number) request.get("amount")).doubleValue() : null;
        String currency = request.getOrDefault("currency", "INR").toString();
        String paymentMethod = request.getOrDefault("paymentMethod", "RAZORPAY").toString();

        if (subscriptionId == null || subscriptionId.isBlank()) {
            return ApiResponse.error("subscriptionId is required");
        }
        if (amount == null || amount <= 0) {
            return ApiResponse.error("Valid amount is required");
        }

        subscriptionSecurityService.validateBillingOwnership(currentUser.getId());
        Map<String, Object> order = paymentService.createPayment(
                currentUser.getId(), subscriptionId, amount, currency, paymentMethod);
        return ApiResponse.success(order, "Payment order created successfully");
    }

    // ─── Verify Payment ───────────────────────────────────────────────────────

    @PostMapping("/verify")
    @Operation(
        summary = "Verify Payment",
        description = "Verifies the Razorpay payment signature after a successful frontend payment. " +
                      "On success, activates the associated subscription and generates an invoice."
    )
    public ApiResponse<Payment> verifyPayment(@RequestBody Map<String, String> request) {
        String transactionId  = request.get("transactionId");
        String paymentGatewayId = request.get("paymentGatewayId");
        String signature      = request.get("signature");
        String status         = request.getOrDefault("status", "SUCCESS");

        if (transactionId == null || paymentGatewayId == null || signature == null) {
            return ApiResponse.error("transactionId, paymentGatewayId, and signature are required");
        }

        Payment payment = paymentService.verifyPayment(transactionId, paymentGatewayId, signature, status);
        return ApiResponse.success(payment, "Payment verification completed");
    }

    // ─── Get Payment History ──────────────────────────────────────────────────

    @GetMapping("/history")
    @Operation(
        summary = "Get Payment History",
        description = "Returns all payment records for the authenticated user, ordered by date descending."
    )
    public ApiResponse<List<Payment>> getPaymentHistory(@AuthenticationPrincipal User currentUser) {
        List<Payment> history = paymentService.getPaymentHistory(currentUser.getId());
        return ApiResponse.success(history, "Payment history retrieved successfully");
    }

    // ─── Get Payment by ID ────────────────────────────────────────────────────

    @GetMapping("/{id}")
    @Operation(
        summary = "Get Payment by ID",
        description = "Returns a specific payment record. Only the payment owner can access their records."
    )
    public ApiResponse<Payment> getPayment(
            @AuthenticationPrincipal User currentUser,
            @Parameter(description = "Payment record ID") @PathVariable String id) {
        Payment payment = paymentService.getPayment(id, currentUser.getId());
        return ApiResponse.success(payment, "Payment retrieved successfully");
    }

    // ─── Refund Payment ───────────────────────────────────────────────────────

    @PostMapping("/{id}/refund")
    @Operation(
        summary = "Refund Payment",
        description = "Initiates a refund for a specific payment. Requires billing ownership validation."
    )
    public ApiResponse<Payment> refundPayment(
            @AuthenticationPrincipal User currentUser,
            @Parameter(description = "Payment record ID to refund") @PathVariable String id) {
        subscriptionSecurityService.validateBillingOwnership(currentUser.getId());
        Payment payment = paymentService.refundPayment(id, currentUser.getId());
        return ApiResponse.success(payment, "Payment refund initiated successfully");
    }
}
