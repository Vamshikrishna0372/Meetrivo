package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.dto.ScheduleMeetingRequest;
import com.meetrivo.model.ScheduledMeeting;
import com.meetrivo.model.ScheduledMeetingStatus;
import com.meetrivo.service.SchedulingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
@Tag(name = "Meeting Scheduling", description = "Endpoints for scheduling, updating, cancelling, and listing meetings")
public class SchedulingController {

    private final SchedulingService schedulingService;

    // ─── Schedule a New Meeting ───────────────────────────────────────────────

    @PostMapping
    @Operation(summary = "Schedule Meeting", description = "Creates a new scheduled meeting and provisions the underlying meeting room.")
    public ApiResponse<ScheduledMeeting> scheduleMeeting(@Valid @RequestBody ScheduleMeetingRequest request) {
        ScheduledMeeting meeting = ScheduledMeeting.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .timezone(request.getTimezone())
                .recurring(request.isRecurring())
                .recurrenceRule(request.getRecurrenceRule())
                .build();

        ScheduledMeeting scheduled = schedulingService.scheduleMeeting(meeting);
        return ApiResponse.success(scheduled, "Meeting scheduled successfully");
    }

    // ─── Update a Scheduled Meeting ───────────────────────────────────────────

    @PutMapping("/{meetingId}")
    @Operation(summary = "Update Scheduled Meeting", description = "Updates title, description, time, timezone, or recurrence. Host only.")
    public ApiResponse<ScheduledMeeting> updateMeeting(
            @PathVariable String meetingId,
            @Valid @RequestBody ScheduleMeetingRequest request) {

        ScheduledMeeting updates = ScheduledMeeting.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .timezone(request.getTimezone())
                .recurring(request.isRecurring())
                .recurrenceRule(request.getRecurrenceRule())
                .status(ScheduledMeetingStatus.UPCOMING)
                .build();

        ScheduledMeeting updated = schedulingService.updateMeetingSchedule(meetingId, updates);
        return ApiResponse.success(updated, "Meeting schedule updated successfully");
    }

    // ─── Cancel a Scheduled Meeting ───────────────────────────────────────────

    @DeleteMapping("/{meetingId}")
    @Operation(summary = "Cancel Scheduled Meeting", description = "Cancels a scheduled meeting and notifies all accepted invitees. Host only.")
    public ApiResponse<String> cancelMeeting(@PathVariable String meetingId) {
        schedulingService.cancelMeeting(meetingId);
        return ApiResponse.success("Meeting cancelled successfully", "Success");
    }

    // ─── Upcoming Meetings ────────────────────────────────────────────────────

    @GetMapping("/upcoming")
    @Operation(summary = "Upcoming Meetings", description = "Returns all scheduled meetings that have not yet started, ordered by start time ascending.")
    public ApiResponse<List<ScheduledMeeting>> getUpcomingMeetings() {
        List<ScheduledMeeting> meetings = schedulingService.getUpcomingMeetings();
        return ApiResponse.success(meetings, "Upcoming meetings retrieved successfully");
    }

    // ─── Meeting History ──────────────────────────────────────────────────────

    @GetMapping("/history")
    @Operation(summary = "Meeting History", description = "Returns all past scheduled meetings ordered by start time descending.")
    public ApiResponse<List<ScheduledMeeting>> getMeetingHistory() {
        List<ScheduledMeeting> meetings = schedulingService.getPastMeetings();
        return ApiResponse.success(meetings, "Meeting history retrieved successfully");
    }
}
