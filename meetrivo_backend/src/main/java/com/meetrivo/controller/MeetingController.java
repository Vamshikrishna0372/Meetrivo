package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.dto.CreateMeetingRequest;
import com.meetrivo.dto.MeetingResponse;
import com.meetrivo.dto.UpdateMeetingRequest;
import com.meetrivo.service.MeetingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
@Tag(name = "Meeting Management", description = "Endpoints for creating and managing meeting rooms")
public class MeetingController {

    private final MeetingService meetingService;

    @PostMapping
    @Operation(summary = "Create Meeting", description = "Creates a new scheduled or instant meeting room")
    public ApiResponse<MeetingResponse> createMeeting(@RequestBody CreateMeetingRequest request) {
        MeetingResponse meeting = meetingService.createMeeting(request);
        return ApiResponse.success(meeting, "Meeting created successfully");
    }

    @GetMapping("/{meetingId}")
    @Operation(summary = "Get Meeting", description = "Retrieves meeting details by meeting UUID")
    public ApiResponse<MeetingResponse> getMeeting(@PathVariable String meetingId) {
        MeetingResponse meeting = meetingService.getMeeting(meetingId);
        return ApiResponse.success(meeting, "Meeting details retrieved successfully");
    }

    @PutMapping("/{meetingId}")
    @Operation(summary = "Update Meeting", description = "Updates details of an existing meeting. Only the host can perform this action.")
    public ApiResponse<MeetingResponse> updateMeeting(
            @PathVariable String meetingId,
            @RequestBody UpdateMeetingRequest request) {
        MeetingResponse meeting = meetingService.updateMeeting(meetingId, request);
        return ApiResponse.success(meeting, "Meeting updated successfully");
    }

    @DeleteMapping("/{meetingId}")
    @Operation(summary = "Delete Meeting", description = "Deletes a meeting room. Only the host can perform this action.")
    public ApiResponse<String> deleteMeeting(@PathVariable String meetingId) {
        meetingService.deleteMeeting(meetingId);
        return ApiResponse.success("Meeting deleted successfully", "Meeting deleted successfully");
    }

    @GetMapping("/my")
    @Operation(summary = "Get My Meetings", description = "Retrieves all meetings hosted by the currently logged-in user")
    public ApiResponse<List<MeetingResponse>> getMyMeetings() {
        List<MeetingResponse> meetings = meetingService.getMyMeetings();
        return ApiResponse.success(meetings, "My meetings retrieved successfully");
    }

    @PostMapping("/{meetingId}/start")
    @Operation(summary = "Start Meeting", description = "Starts the meeting, setting status to ACTIVE. Only the host can perform this action.")
    public ApiResponse<MeetingResponse> startMeeting(@PathVariable String meetingId) {
        MeetingResponse meeting = meetingService.startMeeting(meetingId);
        return ApiResponse.success(meeting, "Meeting started successfully");
    }

    @PostMapping("/{meetingId}/end")
    @Operation(summary = "End Meeting", description = "Ends the meeting, setting status to ENDED. Only the host can perform this action.")
    public ApiResponse<MeetingResponse> endMeeting(@PathVariable String meetingId) {
        MeetingResponse meeting = meetingService.endMeeting(meetingId);
        return ApiResponse.success(meeting, "Meeting ended successfully");
    }

    @GetMapping("/search")
    @Operation(summary = "Search Meetings", description = "Searches for meetings by meetingId, meetingCode, or hostId")
    public ApiResponse<List<MeetingResponse>> searchMeetings(
            @RequestParam(required = false) String meetingId,
            @RequestParam(required = false) String meetingCode,
            @RequestParam(required = false) String hostId) {
        List<MeetingResponse> meetings = meetingService.searchMeetings(meetingId, meetingCode, hostId);
        return ApiResponse.success(meetings, "Meetings searched successfully");
    }

    @PostMapping("/{meetingId}/lock")
    @Operation(summary = "Lock Meeting", description = "Locks the meeting room. Only host/co-host/moderator can perform this.")
    public ApiResponse<String> lockMeeting(@PathVariable String meetingId) {
        meetingService.lockMeeting(meetingId);
        return ApiResponse.success("Meeting locked successfully", "Meeting locked successfully");
    }

    @PostMapping("/{meetingId}/unlock")
    @Operation(summary = "Unlock Meeting", description = "Unlocks the meeting room. Only host/co-host/moderator can perform this.")
    public ApiResponse<String> unlockMeeting(@PathVariable String meetingId) {
        meetingService.unlockMeeting(meetingId);
        return ApiResponse.success("Meeting unlocked successfully", "Meeting unlocked successfully");
    }

    @PostMapping("/{meetingId}/password")
    @Operation(summary = "Change Meeting Password", description = "Updates or removes meeting password. Only host/co-host/moderator can perform this.")
    public ApiResponse<String> changeMeetingPassword(@PathVariable String meetingId, @RequestBody java.util.Map<String, String> body) {
        meetingService.changeMeetingPassword(meetingId, body.get("password"));
        return ApiResponse.success("Meeting password updated successfully", "Meeting password updated successfully");
    }

    @PostMapping("/{meetingId}/approve/{userId}")
    @Operation(summary = "Approve Participant", description = "Approves a participant in the waiting room. Only host/co-host/moderator can perform this.")
    public ApiResponse<String> approveParticipant(@PathVariable String meetingId, @PathVariable String userId) {
        meetingService.approveParticipant(meetingId, userId);
        return ApiResponse.success("Participant approved successfully", "Participant approved successfully");
    }

    @PostMapping("/{meetingId}/reject/{userId}")
    @Operation(summary = "Reject Participant", description = "Rejects a participant in the waiting room. Only host/co-host/moderator can perform this.")
    public ApiResponse<String> rejectParticipant(@PathVariable String meetingId, @PathVariable String userId) {
        meetingService.rejectParticipant(meetingId, userId);
        return ApiResponse.success("Participant rejected successfully", "Participant rejected successfully");
    }

    @PostMapping("/{meetingId}/remove/{userId}")
    @Operation(summary = "Remove Participant", description = "Removes a participant from the meeting. Only host/co-host/moderator can perform this.")
    public ApiResponse<String> removeParticipant(@PathVariable String meetingId, @PathVariable String userId) {
        meetingService.removeParticipant(meetingId, userId);
        return ApiResponse.success("Participant removed successfully", "Participant removed successfully");
    }

    @PostMapping("/{meetingId}/ban/{userId}")
    @Operation(summary = "Ban Participant", description = "Bans a participant from the meeting. Only host/co-host/moderator can perform this.")
    public ApiResponse<String> banParticipant(@PathVariable String meetingId, @PathVariable String userId) {
        meetingService.banParticipant(meetingId, userId);
        return ApiResponse.success("Participant banned successfully", "Participant banned successfully");
    }

    @PostMapping("/{meetingId}/unban/{userId}")
    @Operation(summary = "Unban Participant", description = "Unbans a participant from the meeting. Only host/co-host/moderator can perform this.")
    public ApiResponse<String> unbanParticipant(@PathVariable String meetingId, @PathVariable String userId) {
        meetingService.unbanParticipant(meetingId, userId);
        return ApiResponse.success("Participant unbanned successfully", "Participant unbanned successfully");
    }

    @PostMapping("/{meetingId}/assign-role/{userId}")
    @Operation(summary = "Assign Role to Participant", description = "Assigns Co-Host or Moderator role to participant. Only host can perform this.")
    public ApiResponse<String> assignRole(@PathVariable String meetingId, @PathVariable String userId, @RequestParam com.meetrivo.model.ParticipantRole role) {
        meetingService.assignCoHost(meetingId, userId, role);
        return ApiResponse.success("Role assigned successfully", "Role assigned successfully");
    }
}
