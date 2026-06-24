package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.dto.InviteMemberRequest;
import com.meetrivo.dto.OrganizationAnalyticsResponse;
import com.meetrivo.dto.OrganizationRequest;
import com.meetrivo.model.*;
import com.meetrivo.service.OrganizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
@Tag(name = "Organization Management", description = "Endpoints for managing organizations, members, teams, departments, and invitations")
public class OrganizationController {

    private final OrganizationService organizationService;

    @PostMapping
    @Operation(summary = "Create Organization", description = "Creates a new enterprise organization")
    public ApiResponse<Organization> createOrganization(@Valid @RequestBody OrganizationRequest request) {
        return ApiResponse.success(organizationService.createOrganization(request, getCurrentUserId()), "Organization created successfully");
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Organization", description = "Updates organization details")
    public ApiResponse<Organization> updateOrganization(@PathVariable String id, @Valid @RequestBody OrganizationRequest request) {
        return ApiResponse.success(organizationService.updateOrganization(id, request, getCurrentUserId()), "Organization updated successfully");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Organization", description = "Deletes organization and all its resources")
    public ApiResponse<Void> deleteOrganization(@PathVariable String id) {
        organizationService.deleteOrganization(id, getCurrentUserId());
        return ApiResponse.success(null, "Organization deleted successfully");
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Organization by ID", description = "Retrieves details of an organization")
    public ApiResponse<Organization> getOrganization(@PathVariable String id) {
        return ApiResponse.success(organizationService.getOrganization(id), "Organization retrieved successfully");
    }

    @GetMapping("/my")
    @Operation(summary = "Get My Organizations", description = "Retrieves organizations that current user belongs to")
    public ApiResponse<List<Organization>> getMyOrganizations() {
        return ApiResponse.success(organizationService.getMyOrganizations(getCurrentUserId()), "User organizations retrieved successfully");
    }

    @GetMapping("/{id}/analytics")
    @Operation(summary = "Get Organization Analytics", description = "Retrieves organization analytics including members, teams, and usage metrics")
    public ApiResponse<OrganizationAnalyticsResponse> getOrganizationAnalytics(@PathVariable String id) {
        return ApiResponse.success(organizationService.getOrganizationAnalytics(id, getCurrentUserId()), "Organization analytics retrieved successfully");
    }

    @GetMapping("/{id}/members")
    @Operation(summary = "Get Organization Members", description = "Retrieves members of an organization")
    public ApiResponse<List<OrganizationMember>> getOrganizationMembers(@PathVariable String id) {
        return ApiResponse.success(organizationService.getOrganizationMembers(id), "Organization members retrieved successfully");
    }

    @GetMapping("/{id}/teams")
    @Operation(summary = "Get Organization Teams", description = "Retrieves teams of an organization")
    public ApiResponse<List<Team>> getOrganizationTeams(@PathVariable String id) {
        return ApiResponse.success(organizationService.getOrganizationTeams(id), "Organization teams retrieved successfully");
    }

    @GetMapping("/{id}/departments")
    @Operation(summary = "Get Organization Departments", description = "Retrieves departments of an organization")
    public ApiResponse<List<Department>> getOrganizationDepartments(@PathVariable String id) {
        return ApiResponse.success(organizationService.getOrganizationDepartments(id), "Organization departments retrieved successfully");
    }

    @PostMapping("/{id}/invitations")
    @Operation(summary = "Invite Member to Organization", description = "Invites a member to join the organization via email")
    public ApiResponse<OrganizationInvitation> inviteMember(@PathVariable String id, @Valid @RequestBody InviteMemberRequest request) {
        return ApiResponse.success(organizationService.inviteMember(id, request, getCurrentUserId()), "Member invited successfully");
    }

    @PostMapping("/invitations/{invitationId}/accept")
    @Operation(summary = "Accept Organization Invitation", description = "Accepts a pending organization invitation")
    public ApiResponse<Void> acceptInvitation(@PathVariable String invitationId) {
        organizationService.acceptInvitation(invitationId, getCurrentUserId());
        return ApiResponse.success(null, "Invitation accepted successfully");
    }

    @PostMapping("/invitations/{invitationId}/decline")
    @Operation(summary = "Decline Organization Invitation", description = "Declines a pending organization invitation")
    public ApiResponse<Void> declineInvitation(@PathVariable String invitationId) {
        organizationService.declineInvitation(invitationId, getCurrentUserId());
        return ApiResponse.success(null, "Invitation declined successfully");
    }

    @DeleteMapping("/{id}/members/{memberUserId}")
    @Operation(summary = "Remove Member from Organization", description = "Removes a member from the organization")
    public ApiResponse<Void> removeMember(@PathVariable String id, @PathVariable String memberUserId) {
        organizationService.removeMember(id, memberUserId, getCurrentUserId());
        return ApiResponse.success(null, "Member removed successfully");
    }

    private String getCurrentUserId() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return user.getId();
    }
}
