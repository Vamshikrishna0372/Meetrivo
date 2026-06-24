package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.model.SupportTicket;
import com.meetrivo.service.SupportTicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
@Tag(name = "Support Management", description = "Endpoints for user helpdesk and support tickets")
public class SupportTicketController {

    private final SupportTicketService supportTicketService;

    @PostMapping
    @Operation(summary = "Create Support Ticket", description = "Submits a new customer support ticket")
    public ApiResponse<SupportTicket> createTicket(@RequestBody SupportTicket ticket) {
        return ApiResponse.success(supportTicketService.createTicket(ticket), "Support ticket created successfully");
    }

    @GetMapping("/my")
    @Operation(summary = "Get My Support Tickets", description = "Retrieves helpdesk tickets submitted by current user")
    public ApiResponse<List<SupportTicket>> getMyTickets() {
        return ApiResponse.success(supportTicketService.getUserTickets(), "My support tickets retrieved");
    }

    @GetMapping
    @Operation(summary = "Get All Support Tickets", description = "Retrieves all support tickets across the platform. Access restricted to Admin.")
    public ApiResponse<List<SupportTicket>> getAllTickets() {
        return ApiResponse.success(supportTicketService.getAllTickets(), "All platform support tickets retrieved");
    }

    @PutMapping("/{ticketId}/status")
    @Operation(summary = "Update Ticket Status", description = "Updates status of support ticket (e.g. IN_PROGRESS, RESOLVED, CLOSED)")
    public ApiResponse<SupportTicket> updateTicketStatus(@PathVariable String ticketId, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null) {
            throw new RuntimeException("Status parameter is required");
        }
        return ApiResponse.success(supportTicketService.updateTicketStatus(ticketId, status), "Ticket status updated");
    }
}
