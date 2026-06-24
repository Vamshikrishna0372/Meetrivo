package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.model.Meeting;
import com.meetrivo.model.MeetingParticipant;
import com.meetrivo.service.PlatformAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/meetings")
@RequiredArgsConstructor
@Tag(name = "Meeting Moderation", description = "Endpoints for platform administrators to moderate meetings and inspect participants.")
public class AdminMeetingController {

    private final PlatformAdminService adminService;

    @GetMapping
    @Operation(summary = "View Meetings", description = "Retrieves all meeting sessions on the platform.")
    public ApiResponse<List<Meeting>> getAllMeetings() {
        List<Meeting> meetings = adminService.getAllMeetings();
        return ApiResponse.success(meetings, "Meetings retrieved successfully");
    }

    @PostMapping("/{meetingId}/terminate")
    @Operation(summary = "Terminate Meeting", description = "Forcefully terminates a live meeting session.")
    public ApiResponse<Meeting> terminateMeeting(@PathVariable String meetingId) {
        Meeting meeting = adminService.terminateMeeting(meetingId);
        return ApiResponse.success(meeting, "Meeting terminated successfully");
    }

    @DeleteMapping("/{meetingId}")
    @Operation(summary = "Delete Meeting", description = "Deletes a meeting session metadata from the database. Super Admin only.")
    public ApiResponse<String> deleteMeeting(@PathVariable String meetingId) {
        adminService.deleteMeeting(meetingId);
        return ApiResponse.success("Meeting metadata deleted successfully", "Success");
    }

    @GetMapping("/{meetingId}/participants")
    @Operation(summary = "View Participants", description = "Retrieves the participant history/list for a specific meeting session.")
    public ApiResponse<List<MeetingParticipant>> getParticipants(@PathVariable String meetingId) {
        List<MeetingParticipant> participants = adminService.getParticipants(meetingId);
        return ApiResponse.success(participants, "Meeting participants retrieved successfully");
    }
}
