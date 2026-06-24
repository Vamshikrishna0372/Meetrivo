package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.model.MeetingAttendance;
import com.meetrivo.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance Management", description = "Endpoints for tracking meeting attendance and exporting reports")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/meeting/{meetingId}")
    @Operation(summary = "Get Meeting Attendance List", description = "Retrieves raw attendance records for a specific meeting")
    public ApiResponse<List<MeetingAttendance>> getMeetingAttendance(@PathVariable String meetingId) {
        return ApiResponse.success(attendanceService.getMeetingAttendance(meetingId), "Attendance list retrieved");
    }

    @GetMapping("/meeting/{meetingId}/report")
    @Operation(summary = "Generate Meeting Attendance Report", description = "Generates aggregated attendance report for a specific meeting")
    public ApiResponse<Map<String, Object>> getMeetingAttendanceReport(@PathVariable String meetingId) {
        return ApiResponse.success(attendanceService.generateMeetingAttendanceReport(meetingId), "Meeting attendance report generated");
    }

    @GetMapping("/meeting/{meetingId}/durations")
    @Operation(summary = "Generate Participant Duration Report", description = "Generates duration metrics sorted by longest participant duration")
    public ApiResponse<Map<String, Object>> getParticipantDurationReport(@PathVariable String meetingId) {
        return ApiResponse.success(attendanceService.generateParticipantDurationReport(meetingId), "Participant duration report generated");
    }

    @GetMapping("/org/{orgId}/report")
    @Operation(summary = "Generate Organization Attendance Report", description = "Generates attendance statistics for an organization")
    public ApiResponse<Map<String, Object>> getOrganizationAttendanceReport(@PathVariable String orgId) {
        return ApiResponse.success(attendanceService.generateOrganizationAttendanceReport(orgId), "Organization attendance report generated");
    }

    @GetMapping("/team/{teamId}/report")
    @Operation(summary = "Generate Team Attendance Report", description = "Generates attendance statistics for a specific team")
    public ApiResponse<Map<String, Object>> getTeamAttendanceReport(@PathVariable String teamId) {
        return ApiResponse.success(attendanceService.generateTeamAttendanceReport(teamId), "Team attendance report generated");
    }

    @GetMapping("/meeting/{meetingId}/export/csv")
    @Operation(summary = "Export Report to CSV", description = "Exports meeting attendance report as a CSV file")
    public ResponseEntity<byte[]> exportToCsv(@PathVariable String meetingId) {
        Map<String, Object> report = attendanceService.generateMeetingAttendanceReport(meetingId);
        String csvData = attendanceService.exportToCsv(report);
        byte[] bytes = csvData.getBytes();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance_report_" + meetingId + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }

    @GetMapping("/meeting/{meetingId}/export/excel")
    @Operation(summary = "Export Report to Excel", description = "Exports meeting attendance report as an XML-based Excel file")
    public ResponseEntity<byte[]> exportToExcel(@PathVariable String meetingId) {
        Map<String, Object> report = attendanceService.generateMeetingAttendanceReport(meetingId);
        String excelData = attendanceService.exportToExcel(report);
        byte[] bytes = excelData.getBytes();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance_report_" + meetingId + ".xls")
                .contentType(MediaType.parseMediaType("application/vnd.ms-excel"))
                .body(bytes);
    }

    @GetMapping("/meeting/{meetingId}/export/pdf")
    @Operation(summary = "Export Report to PDF structure", description = "Returns PDF-ready structured JSON data for client-side rendering or PDF service")
    public ApiResponse<Map<String, Object>> exportToPdf(@PathVariable String meetingId) {
        Map<String, Object> report = attendanceService.generateMeetingAttendanceReport(meetingId);
        report.put("format", "PDF");
        report.put("orientation", "PORTRAIT");
        return ApiResponse.success(report, "PDF structured data generated");
    }
}
