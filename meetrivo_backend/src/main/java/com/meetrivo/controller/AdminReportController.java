package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.model.Report;
import com.meetrivo.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@Tag(name = "Reports & Analytics Generation", description = "Endpoints for generating activity reports and exporting them as CSV, Excel, or PDF structure. Admin only.")
public class AdminReportController {

    private final ReportService reportService;

    @GetMapping("/users")
    @Operation(summary = "Generate User Report", description = "Creates and returns a registration/active users statistics report.")
    public ApiResponse<Report> generateUserReport() {
        Report report = reportService.generateUserReport();
        return ApiResponse.success(report, "User report generated successfully");
    }

    @GetMapping("/meetings")
    @Operation(summary = "Generate Meeting Report", description = "Creates and returns a meetings duration/engagement statistics report.")
    public ApiResponse<Report> generateMeetingReport() {
        Report report = reportService.generateMeetingReport();
        return ApiResponse.success(report, "Meeting report generated successfully");
    }

    @GetMapping("/system")
    @Operation(summary = "Generate System Report", description = "Creates and returns a system overview and trends report.")
    public ApiResponse<Report> generateSystemReport() {
        Report report = reportService.generateSystemReport();
        return ApiResponse.success(report, "System report generated successfully");
    }

    @GetMapping("/{id}/export/csv")
    @Operation(summary = "Export Report to CSV", description = "Generates and downloads a CSV export file of a report.")
    public ResponseEntity<String> exportCsv(@PathVariable String id) {
        String csv = reportService.exportToCsv(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"report_" + id + ".csv\"")
                .contentType(MediaType.TEXT_PLAIN)
                .body(csv);
    }

    @GetMapping("/{id}/export/excel")
    @Operation(summary = "Export Report to Excel", description = "Generates and downloads an Excel XML export of a report.")
    public ResponseEntity<String> exportExcel(@PathVariable String id) {
        String excel = reportService.exportToExcel(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"report_" + id + ".xls\"")
                .contentType(MediaType.parseMediaType("application/vnd.ms-excel"))
                .body(excel);
    }

    @GetMapping("/{id}/export/pdf")
    @Operation(summary = "Export Report PDF Structure", description = "Returns a JSON structure ready to be compiled to PDF.")
    public ApiResponse<Map<String, Object>> exportPdf(@PathVariable String id) {
        Map<String, Object> pdfStructure = reportService.getPdfReadyStructure(id);
        return ApiResponse.success(pdfStructure, "PDF structure compiled successfully");
    }
}
