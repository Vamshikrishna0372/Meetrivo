package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.dto.MeetingResponse;
import com.meetrivo.model.MeetingTemplate;
import com.meetrivo.service.MeetingTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/meeting-templates", "/api/templates"})
@RequiredArgsConstructor
@Tag(name = "Meeting Templates", description = "Endpoints for managing reusable personal and organization meeting settings")
public class MeetingTemplateController {

    private final MeetingTemplateService meetingTemplateService;

    @PostMapping
    @Operation(summary = "Create Meeting Template", description = "Creates a reusable meeting template with specific configuration flags")
    public ApiResponse<MeetingTemplate> createTemplate(@RequestBody MeetingTemplate template) {
        return ApiResponse.success(meetingTemplateService.createTemplate(template), "Template created successfully");
    }

    @GetMapping
    @Operation(summary = "Get Reusable Templates", description = "Retrieves all available meeting templates (personal and organization)")
    public ApiResponse<List<MeetingTemplate>> getTemplates(@RequestParam(value = "organizationId", required = false) String orgId) {
        return ApiResponse.success(meetingTemplateService.getAvailableTemplates(orgId), "Templates retrieved successfully");
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Template Details", description = "Retrieves details of a specific meeting template")
    public ApiResponse<MeetingTemplate> getTemplate(@PathVariable String id) {
        return ApiResponse.success(meetingTemplateService.getTemplate(id), "Template details retrieved successfully");
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Meeting Template", description = "Updates an existing meeting template. Only the creator can perform this.")
    public ApiResponse<MeetingTemplate> updateTemplate(@PathVariable String id, @RequestBody MeetingTemplate template) {
        return ApiResponse.success(meetingTemplateService.updateTemplate(id, template), "Template updated successfully");
    }

    @PostMapping("/{id}/create-meeting")
    @Operation(summary = "Create Meeting From Template", description = "Creates a new meeting using the template configurations")
    public ApiResponse<MeetingResponse> createMeetingFromTemplate(@PathVariable String id) {
        return ApiResponse.success(meetingTemplateService.createMeetingFromTemplate(id), "Meeting created from template successfully");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Template", description = "Deletes a reusable template. Only the owner can delete it.")
    public ApiResponse<String> deleteTemplate(@PathVariable String id) {
        meetingTemplateService.deleteTemplate(id);
        return ApiResponse.success("Template deleted successfully", "Template deleted successfully");
    }
}
