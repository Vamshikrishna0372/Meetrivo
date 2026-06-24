package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.dto.SendInvitationRequest;
import com.meetrivo.model.MeetingInvitation;
import com.meetrivo.service.InvitationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
@Tag(name = "Meeting Invitations", description = "Endpoints for sending, accepting, declining, and managing meeting invitations")
public class InvitationController {

    private final InvitationService invitationService;

    // ─── Send Invitation ──────────────────────────────────────────────────────

    @PostMapping("/send")
    @Operation(summary = "Send Invitation", description = "Sends a meeting invitation to a recipient by email. Only the meeting host can send invitations.")
    public ApiResponse<MeetingInvitation> sendInvitation(@Valid @RequestBody SendInvitationRequest request) {
        MeetingInvitation invitation = invitationService.sendInvitation(
                request.getMeetingId(),
                request.getReceiverEmail()
        );
        return ApiResponse.success(invitation, "Invitation sent successfully");
    }

    // ─── Accept Invitation ────────────────────────────────────────────────────

    @PostMapping("/{id}/accept")
    @Operation(summary = "Accept Invitation", description = "Accepts a pending meeting invitation. Only the invited recipient can accept.")
    public ApiResponse<MeetingInvitation> acceptInvitation(@PathVariable String id) {
        MeetingInvitation invitation = invitationService.acceptInvitation(id);
        return ApiResponse.success(invitation, "Invitation accepted successfully");
    }

    // ─── Decline Invitation ───────────────────────────────────────────────────

    @PostMapping("/{id}/decline")
    @Operation(summary = "Decline Invitation", description = "Declines a pending meeting invitation. Only the invited recipient can decline.")
    public ApiResponse<MeetingInvitation> declineInvitation(@PathVariable String id) {
        MeetingInvitation invitation = invitationService.declineInvitation(id);
        return ApiResponse.success(invitation, "Invitation declined successfully");
    }

    // ─── Resend Invitation ────────────────────────────────────────────────────

    @PostMapping("/{id}/resend")
    @Operation(summary = "Resend Invitation", description = "Re-sends a previously sent invitation. Only the meeting host can resend.")
    public ApiResponse<MeetingInvitation> resendInvitation(@PathVariable String id) {
        MeetingInvitation invitation = invitationService.resendInvitation(id);
        return ApiResponse.success(invitation, "Invitation resent successfully");
    }

    // ─── My Invitations ───────────────────────────────────────────────────────

    @GetMapping("/my")
    @Operation(summary = "My Invitations", description = "Returns all invitations received by the authenticated user, matched by userId or email.")
    public ApiResponse<List<MeetingInvitation>> getMyInvitations() {
        List<MeetingInvitation> invitations = invitationService.getMyInvitations();
        return ApiResponse.success(invitations, "Invitations retrieved successfully");
    }
}
