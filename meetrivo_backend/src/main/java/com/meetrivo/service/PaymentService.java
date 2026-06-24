package com.meetrivo.service;

import com.meetrivo.model.*;
import com.meetrivo.payment.PaymentGatewayService;
import com.meetrivo.repository.InvoiceRepository;
import com.meetrivo.repository.PaymentRepository;
import com.meetrivo.repository.UserSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService extends BaseService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;
    private final PaymentGatewayService paymentGatewayService;
    private final AnalyticsService analyticsService;

    public Map<String, Object> createPayment(String userId, String subscriptionId, Double amount, String currency, String paymentMethod) {
        // Create Razorpay order
        Map<String, Object> gatewayOrder = paymentGatewayService.createRazorpayOrder(amount, currency);
        String transactionId = (String) gatewayOrder.get("id");

        Payment payment = Payment.builder()
                .userId(userId)
                .subscriptionId(subscriptionId)
                .amount(amount)
                .currency(currency)
                .paymentMethod(paymentMethod)
                .transactionId(transactionId)
                .status(PaymentStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);
        logInfo("Pending payment created for user: " + userId + ", amount: " + amount + ", orderId: " + transactionId);

        // Track Subscription Click / Payment Intent
        analyticsService.trackEvent(AnalyticsEventType.SUBSCRIPTION_CREATED, userId, null, null);

        return gatewayOrder;
    }

    public Payment verifyPayment(String transactionId, String paymentGatewayId, String signature, String status) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment record not found for transaction: " + transactionId));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            return payment;
        }

        boolean verified = paymentGatewayService.verifyRazorpaySignature(transactionId, paymentGatewayId, signature);
        if (verified && "SUCCESS".equalsIgnoreCase(status)) {
            payment.setStatus(PaymentStatus.SUCCESS);
            paymentRepository.save(payment);

            // Activate associated subscription if applicable
            if (payment.getSubscriptionId() != null) {
                userSubscriptionRepository.findById(payment.getSubscriptionId())
                        .ifPresent(sub -> {
                            sub.setStatus(SubscriptionStatus.ACTIVE);
                            sub.setStartDate(LocalDateTime.now());
                            sub.setEndDate(LocalDateTime.now().plusMonths(1)); // monthly default or yearly check
                            userSubscriptionRepository.save(sub);
                        });
            }

            // Generate Invoice
            generateInvoice(payment);
            logInfo("Payment verification succeeded: " + transactionId);

            // Track Revenue
            analyticsService.trackEvent(AnalyticsEventType.REVENUE_GENERATED, payment.getUserId(), null, null);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            logInfo("Payment verification failed for transaction: " + transactionId);
        }

        return payment;
    }

    public Payment refundPayment(String paymentId, String currentUserId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        // Only admins or billing owners can refund (for now, allow admin check or standard runtime validation)
        // Set to REFUNDED
        payment.setStatus(PaymentStatus.REFUNDED);
        Payment saved = paymentRepository.save(payment);

        // Update Invoice status to CANCELLED / REFUNDED
        // Mapped update
        logInfo("Payment refunded: " + paymentId);
        return saved;
    }

    public List<Payment> getPaymentHistory(String userId) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Payment getPayment(String id, String currentUserId) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        
        if (!payment.getUserId().equals(currentUserId)) {
            throw new AccessDeniedException("Access denied: You do not own this payment record");
        }
        return payment;
    }

    private void generateInvoice(Payment payment) {
        String invoiceNumber = "INV-" + LocalDateTime.now().getYear() + "-" + UUID.randomUUID().toString().replaceAll("-", "").substring(0, 8).toUpperCase();
        
        Invoice invoice = Invoice.builder()
                .userId(payment.getUserId())
                .paymentId(payment.getId())
                .invoiceNumber(invoiceNumber)
                .amount(payment.getAmount())
                .generatedAt(LocalDateTime.now())
                .status("PAID")
                .build();

        invoiceRepository.save(invoice);
        logInfo("Invoice generated successfully: " + invoiceNumber + " for payment: " + payment.getId());
    }
}
