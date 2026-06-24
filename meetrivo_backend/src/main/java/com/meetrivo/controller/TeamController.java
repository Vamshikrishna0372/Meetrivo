package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.dto.TeamRequest;
import com.meetrivo.model.Team;
import com.meetrivo.model.TeamMember;
import com.meetrivo.model.User;
import com.meetrivo.service.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
@Tag(name = "Team Management", description = "Endpoints for managing teams and their memberships")
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    @Operation(summary = "Create Team", description = "Creates a new team in an organization")
    public ApiResponse<Team> createTeam(@Valid @RequestBody TeamRequest request) {
        return ApiResponse.success(teamService.createTeam(request, getCurrentUserId()), "Team created successfully");
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Team", description = "Updates details of a team")
    public ApiResponse<Team> updateTeam(@PathVariable String id, @Valid @RequestBody TeamRequest request) {
        return ApiResponse.success(teamService.updateTeam(id, request, getCurrentUserId()), "Team updated successfully");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Team", description = "Deletes a team and removes all members")
    public ApiResponse<Void> deleteTeam(@PathVariable String id) {
        teamService.deleteTeam(id, getCurrentUserId());
        return ApiResponse.success(null, "Team deleted successfully");
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Team by ID", description = "Retrieves details of a team")
    public ApiResponse<Team> getTeam(@PathVariable String id) {
        return ApiResponse.success(teamService.getTeam(id), "Team retrieved successfully");
    }

    @GetMapping("/organization/{organizationId}")
    @Operation(summary = "Get Organization Teams", description = "Retrieves all teams belonging to an organization")
    public ApiResponse<List<Team>> getTeamsByOrganization(@PathVariable String organizationId) {
        return ApiResponse.success(teamService.getTeamsByOrganization(organizationId), "Teams retrieved successfully");
    }

    @GetMapping("/{id}/members")
    @Operation(summary = "Get Team Members", description = "Retrieves members of a team")
    public ApiResponse<List<TeamMember>> getTeamMembers(@PathVariable String id) {
        return ApiResponse.success(teamService.getTeamMembers(id), "Team members retrieved successfully");
    }

    @PostMapping("/{id}/members/{userId}")
    @Operation(summary = "Assign Member to Team", description = "Assigns a member to a team")
    public ApiResponse<TeamMember> assignMember(@PathVariable String id, @PathVariable String userId) {
        return ApiResponse.success(teamService.assignMember(id, userId, getCurrentUserId()), "Member assigned to team successfully");
    }

    @DeleteMapping("/{id}/members/{userId}")
    @Operation(summary = "Remove Member from Team", description = "Removes a member from a team")
    public ApiResponse<Void> removeMember(@PathVariable String id, @PathVariable String userId) {
        teamService.removeMember(id, userId, getCurrentUserId());
        return ApiResponse.success(null, "Member removed from team successfully");
    }

    @PutMapping("/{id}/manager/{newManagerId}")
    @Operation(summary = "Transfer Team Manager", description = "Transfers the manager role of a team to another user")
    public ApiResponse<Team> transferManager(@PathVariable String id, @PathVariable String newManagerId) {
        return ApiResponse.success(teamService.transferManager(id, newManagerId, getCurrentUserId()), "Manager transferred successfully");
    }

    private String getCurrentUserId() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return user.getId();
    }
}
