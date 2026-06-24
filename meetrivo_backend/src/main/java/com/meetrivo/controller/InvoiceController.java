package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.model.Invoice;
import com.meetrivo.model.User;
import com.meetrivo.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Tag(name = "Invoices", description = "Invoice retrieval and download endpoints")
public class InvoiceController {

    private final InvoiceService invoiceService;

    // ─── Get All Invoices ─────────────────────────────────────────────────────

    @GetMapping
    @Operation(
        summary = "Get All Invoices",
        description = "Returns all invoices for the authenticated user, ordered by generation date descending."
    )
    public ApiResponse<List<Invoice>> getInvoices(@AuthenticationPrincipal User currentUser) {
        List<Invoice> invoices = invoiceService.getUserInvoices(currentUser.getId());
        return ApiResponse.success(invoices, "Invoices retrieved successfully");
    }

    // ─── Get Invoice by ID ────────────────────────────────────────────────────

    @GetMapping("/{id}")
    @Operation(
        summary = "Get Invoice by ID",
        description = "Returns a specific invoice. Only the invoice owner can retrieve it."
    )
    public ApiResponse<Invoice> getInvoice(
            @AuthenticationPrincipal User currentUser,
            @Parameter(description = "Invoice ID") @PathVariable String id) {
        Invoice invoice = invoiceService.getInvoice(id, currentUser.getId());
        return ApiResponse.success(invoice, "Invoice retrieved successfully");
    }

    // ─── Download Invoice ─────────────────────────────────────────────────────

    @GetMapping("/download/{id}")
    @Operation(
        summary = "Download Invoice",
        description = "Downloads a specific invoice as a plain-text receipt. PDF generation requires iText/PDFBox integration."
    )
    public ResponseEntity<byte[]> downloadInvoice(
            @AuthenticationPrincipal User currentUser,
            @Parameter(description = "Invoice ID to download") @PathVariable String id) {
        byte[] invoiceData = invoiceService.generateInvoiceDownload(id, currentUser.getId());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", "invoice-" + id + ".txt");
        headers.setContentLength(invoiceData.length);
        return ResponseEntity.ok().headers(headers).body(invoiceData);
    }
}
