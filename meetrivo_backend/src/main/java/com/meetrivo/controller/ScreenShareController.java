package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.dto.StartShareRequest;
import com.meetrivo.model.PresentationHistory;
import com.meetrivo.model.ScreenShareSession;
import com.meetrivo.model.SharePermission;
import com.meetrivo.model.User;
import com.meetrivo.service.ScreenShareService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/screen-share")
@RequiredArgsConstructor
@Tag(name = "Screen Sharing & Presentation", description = "Endpoints for handling screen sharing, presenter controls, and remote control requests")
public class ScreenShareController {

    private final ScreenShareService screenShareService;

    // ─── Screen Share Endpoints ───────────────────────────────────────────────

    @PostMapping("/start")
    @Operation(summary = "Start Screen Share", description = "Starts a screen sharing session for the authenticated participant")
    public ApiResponse<ScreenShareSession> startShare(@Valid @RequestBody StartShareRequest request) {
        ScreenShareSession session = screenShareService.startShare(
                request.getMeetingId(),
                request.getSessionId(),
                request.getShareType()
        );
        return ApiResponse.success(session, "Screen share session started successfully");
    }

    @PostMapping("/stop")
    @Operation(summary = "Stop Screen Share", description = "Stops an active screen share session. Hosts can stop anyone's share; users can only stop their own.")
    public ApiResponse<ScreenShareSession> stopShare(
            @RequestParam String meetingId,
            @RequestParam(required = false) String userId) {
        String targetUserId = userId;
        if (targetUserId == null || targetUserId.isBlank()) {
            targetUserId = getCurrentUser().getId();
        }
        ScreenShareSession session = screenShareService.stopShare(meetingId, targetUserId);
        return ApiResponse.success(session, "Screen share session stopped successfully");
    }

    @PostMapping("/pause")
    @Operation(summary = "Pause Screen Share", description = "Pauses the authenticated user's active screen share session")
    public ApiResponse<ScreenShareSession> pauseShare(@RequestParam String meetingId) {
        ScreenShareSession session = screenShareService.pauseShare(meetingId);
        return ApiResponse.success(session, "Screen share session paused successfully");
    }

    @PostMapping("/resume")
    @Operation(summary = "Resume Screen Share", description = "Resumes the authenticated user's paused screen share session")
    public ApiResponse<ScreenShareSession> resumeShare(@RequestParam String meetingId) {
        ScreenShareSession session = screenShareService.resumeShare(meetingId);
        return ApiResponse.success(session, "Screen share session resumed successfully");
    }

    @GetMapping("/status/{meetingId}")
    @Operation(summary = "Get Screen Share Status", description = "Retrieves information about the current presenter/active share in the meeting room")
    public ApiResponse<PresentationHistory> getShareStatus(@PathVariable String meetingId) {
        Optional<PresentationHistory> presenterOpt = screenShareService.getCurrentPresenter(meetingId);
        return presenterOpt
                .map(presenter -> ApiResponse.success(presenter, "Active presenter retrieved successfully"))
                .orElseGet(() -> ApiResponse.success(null, "No active presenter in this meeting"));
    }

    // ─── Presenter Management Endpoints ────────────────────────────────────────

    @PostMapping("/presenter/transfer")
    @Operation(summary = "Transfer Presenter Role", description = "Allows the host to transfer the presenter role to another participant")
    public ApiResponse<String> transferPresenter(
            @RequestParam String meetingId,
            @RequestParam String targetUserId) {
        screenShareService.transferPresenter(meetingId, targetUserId);
        return ApiResponse.success("Presenter role transferred successfully", "Success");
    }

    @PostMapping("/presenter/remove")
    @Operation(summary = "Remove Current Presenter", description = "Allows the host to force-stop the current presentation/screen share")
    public ApiResponse<String> removePresenter(@RequestParam String meetingId) {
        screenShareService.removePresenter(meetingId);
        return ApiResponse.success("Presenter removed successfully", "Success");
    }

    // ─── Share Permissions Endpoints ──────────────────────────────────────────

    @PostMapping("/permissions")
    @Operation(summary = "Update Sharing Permissions", description = "Allows the host to restrict who can share screen (HOST_ONLY, CO_HOST, ALL_PARTICIPANTS)")
    public ApiResponse<String> updateSharePermission(
            @RequestParam String meetingId,
            @RequestParam SharePermission permission) {
        screenShareService.updateSharePermission(meetingId, permission);
        return ApiResponse.success("Screen sharing permissions updated successfully", "Success");
    }

    @PostMapping("/disable")
    @Operation(summary = "Disable Screen Sharing", description = "Allows the host to disable screen sharing globally in the meeting")
    public ApiResponse<String> disableSharing(@RequestParam String meetingId) {
        screenShareService.disableSharing(meetingId);
        return ApiResponse.success("Screen sharing disabled successfully", "Success");
    }

    @PostMapping("/enable")
    @Operation(summary = "Enable Screen Sharing", description = "Allows the host to enable screen sharing globally in the meeting")
    public ApiResponse<String> enableSharing(@RequestParam String meetingId) {
        screenShareService.enableSharing(meetingId);
        return ApiResponse.success("Screen sharing enabled successfully", "Success");
    }

    // ─── Remote Control Endpoints (Foundation Architecture) ───────────────────

    @PostMapping("/remote-control/request")
    @Operation(summary = "Request Remote Control", description = "Allows a participant to request remote control access from the current presenter")
    public ApiResponse<String> requestRemoteControl(
            @RequestParam String meetingId,
            @RequestParam String targetUserId) {
        screenShareService.requestRemoteControl(meetingId, targetUserId);
        return ApiResponse.success("Remote control request sent successfully", "Success");
    }

    @PostMapping("/remote-control/grant")
    @Operation(summary = "Grant Remote Control", description = "Allows the presenter to grant remote control access to the requester")
    public ApiResponse<String> grantRemoteControl(
            @RequestParam String meetingId,
            @RequestParam String requesterId) {
        screenShareService.grantRemoteControl(meetingId, requesterId);
        return ApiResponse.success("Remote control granted successfully", "Success");
    }

    @PostMapping("/remote-control/revoke")
    @Operation(summary = "Revoke Remote Control", description = "Allows the presenter (or host) to revoke remote control access")
    public ApiResponse<String> revokeRemoteControl(
            @RequestParam String meetingId,
            @RequestParam String requesterId) {
        screenShareService.revokeRemoteControl(meetingId, requesterId);
        return ApiResponse.success("Remote control revoked successfully", "Success");
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
