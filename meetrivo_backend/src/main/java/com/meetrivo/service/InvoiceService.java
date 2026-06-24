package com.meetrivo.service;

import com.meetrivo.model.Invoice;
import com.meetrivo.model.Payment;
import com.meetrivo.repository.InvoiceRepository;
import com.meetrivo.repository.PaymentRepository;
import com.meetrivo.repository.UserSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Service for invoice retrieval and generation.
 * Invoice records are created automatically during payment verification in PaymentService.
 * This service provides read access and downloadable invoice generation.
 */
@Service
@RequiredArgsConstructor
public class InvoiceService extends BaseService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;

    /**
     * Returns all invoices for a user, ordered by most recent first.
     */
    public List<Invoice> getUserInvoices(String userId) {
        return invoiceRepository.findByUserIdOrderByGeneratedAtDesc(userId);
    }

    /**
     * Returns a single invoice by ID, ensuring the caller owns the invoice.
     */
    public Invoice getInvoice(String invoiceId, String currentUserId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));

        if (!invoice.getUserId().equals(currentUserId)) {
            throw new AccessDeniedException("Access denied: You do not own this invoice");
        }
        return invoice;
    }

    /**
     * Generates a plain-text representation of an invoice as downloadable bytes.
     * Extend this method with iText or Apache PDFBox for PDF output when required.
     */
    public byte[] generateInvoiceDownload(String invoiceId, String currentUserId) {
        Invoice invoice = getInvoice(invoiceId, currentUserId);

        // Fetch linked payment details if available
        String paymentMethod = "N/A";
        String transactionId = "N/A";
        if (invoice.getPaymentId() != null) {
            paymentRepository.findById(invoice.getPaymentId()).ifPresent(p -> {
                // Payment details are available but stored separately; use invoice fields here
            });
            paymentMethod = paymentRepository.findById(invoice.getPaymentId())
                    .map(Payment::getPaymentMethod).orElse("N/A");
            transactionId = paymentRepository.findById(invoice.getPaymentId())
                    .map(Payment::getTransactionId).orElse("N/A");
        }

        // Build plain-text invoice receipt
        String separator = "=".repeat(60);
        String receiptText = String.format(
            "%s%n" +
            "              MEETRIVO - INVOICE RECEIPT%n" +
            "%s%n%n" +
            "Invoice Number : %s%n" +
            "Invoice Date   : %s%n" +
            "Status         : %s%n%n" +
            "%s%n" +
            "Customer ID    : %s%n" +
            "Payment ID     : %s%n" +
            "Transaction ID : %s%n" +
            "Payment Method : %s%n%n" +
            "%s%n" +
            "Amount Paid    : %.2f INR%n%n" +
            "%s%n" +
            "Thank you for using Meetrivo!%n" +
            "For support: support@meetrivo.com%n" +
            "%s%n",
            separator,
            separator,
            invoice.getInvoiceNumber(),
            invoice.getGeneratedAt() != null ? invoice.getGeneratedAt().toString() : "N/A",
            invoice.getStatus(),
            separator,
            invoice.getUserId(),
            invoice.getPaymentId() != null ? invoice.getPaymentId() : "N/A",
            transactionId,
            paymentMethod,
            separator,
            invoice.getAmount() != null ? invoice.getAmount() : 0.0,
            separator,
            separator
        );

        logInfo("Invoice download generated: " + invoice.getInvoiceNumber() + " for user: " + currentUserId);
        return receiptText.getBytes(StandardCharsets.UTF_8);
    }
}
