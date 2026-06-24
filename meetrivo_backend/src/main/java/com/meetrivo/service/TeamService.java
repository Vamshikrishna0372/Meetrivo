package com.meetrivo.service;

import com.meetrivo.dto.TeamRequest;
import com.meetrivo.model.*;
import com.meetrivo.repository.OrganizationMemberRepository;
import com.meetrivo.repository.TeamMemberRepository;
import com.meetrivo.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamService extends BaseService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final SecurityValidationService securityValidation;

    public Team createTeam(TeamRequest request, String currentUserId) {
        // Only OWNER or ORG_ADMIN can create teams in an organization
        securityValidation.validateOrganizationAccess(request.getOrganizationId(), currentUserId, OrganizationRole.OWNER, OrganizationRole.ORG_ADMIN);

        Team team = Team.builder()
                .organizationId(request.getOrganizationId())
                .name(request.getName())
                .description(request.getDescription())
                .managerId(request.getManagerId())
                .createdAt(LocalDateTime.now())
                .build();

        Team savedTeam = teamRepository.save(team);

        // Auto-assign manager if provided
        if (request.getManagerId() != null) {
            assignMemberInternal(savedTeam.getId(), request.getManagerId(), "MANAGER");
        }

        logInfo("Team created: " + savedTeam.getName() + " in organization: " + savedTeam.getOrganizationId());
        return savedTeam;
    }

    public Team updateTeam(String teamId, TeamRequest request, String currentUserId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        // Only manager, ORG_ADMIN, or OWNER can update team
        boolean isOrgAdmin = false;
        try {
            securityValidation.validateOrganizationAccess(team.getOrganizationId(), currentUserId, OrganizationRole.OWNER, OrganizationRole.ORG_ADMIN);
            isOrgAdmin = true;
        } catch (AccessDeniedException ignored) {}

        if (!isOrgAdmin && !currentUserId.equals(team.getManagerId())) {
            throw new AccessDeniedException("You do not have permission to update this team");
        }

        team.setName(request.getName());
        team.setDescription(request.getDescription());
        
        // If manager changes, handle it
        if (request.getManagerId() != null && !request.getManagerId().equals(team.getManagerId())) {
            transferManagerInternal(team, request.getManagerId(), currentUserId);
        }

        Team updatedTeam = teamRepository.save(team);
        logInfo("Team updated: " + updatedTeam.getName());
        return updatedTeam;
    }

    public void deleteTeam(String teamId, String currentUserId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        // Only OWNER or ORG_ADMIN can delete teams
        securityValidation.validateOrganizationAccess(team.getOrganizationId(), currentUserId, OrganizationRole.OWNER, OrganizationRole.ORG_ADMIN);

        // Delete all members
        List<TeamMember> members = teamMemberRepository.findByTeamId(teamId);
        teamMemberRepository.deleteAll(members);

        teamRepository.delete(team);
        logInfo("Team deleted: " + team.getName());
    }

    public TeamMember assignMember(String teamId, String userId, String currentUserId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        // Validate currentUserId has permission (OWNER, ORG_ADMIN of organization, or MANAGER of team)
        validateTeamModificationAccess(team, currentUserId);

        // User must be a member of the organization
        securityValidation.validateOrganizationAccess(team.getOrganizationId(), userId);

        TeamMember assignedMember = assignMemberInternal(teamId, userId, "MEMBER");
        logInfo("User " + userId + " assigned to team " + teamId);
        return assignedMember;
    }

    public void removeMember(String teamId, String userId, String currentUserId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        // Validate currentUserId has permission or is the user removing themselves
        if (!currentUserId.equals(userId)) {
            validateTeamModificationAccess(team, currentUserId);
        }

        // If user is manager, clear manager field on team
        if (userId.equals(team.getManagerId())) {
            team.setManagerId(null);
            teamRepository.save(team);
        }

        teamMemberRepository.deleteByTeamIdAndUserId(teamId, userId);
        logInfo("User " + userId + " removed from team " + teamId);
    }

    public Team transferManager(String teamId, String newManagerId, String currentUserId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        transferManagerInternal(team, newManagerId, currentUserId);
        return teamRepository.save(team);
    }

    public Team getTeam(String id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found"));
    }

    public List<Team> getTeamsByOrganization(String orgId) {
        return teamRepository.findByOrganizationId(orgId);
    }

    public List<TeamMember> getTeamMembers(String teamId) {
        return teamMemberRepository.findByTeamId(teamId);
    }

    private TeamMember assignMemberInternal(String teamId, String userId, String role) {
        if (teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)) {
            TeamMember existing = teamMemberRepository.findByTeamIdAndUserId(teamId, userId).get();
            if (!existing.getRole().equals(role)) {
                existing.setRole(role);
                return teamMemberRepository.save(existing);
            }
            return existing;
        }

        TeamMember teamMember = TeamMember.builder()
                .teamId(teamId)
                .userId(userId)
                .role(role)
                .joinedAt(LocalDateTime.now())
                .build();
        return teamMemberRepository.save(teamMember);
    }

    private void transferManagerInternal(Team team, String newManagerId, String currentUserId) {
        // Only OWNER, ORG_ADMIN, or current Manager can transfer manager role
        boolean isOrgAdmin = false;
        try {
            securityValidation.validateOrganizationAccess(team.getOrganizationId(), currentUserId, OrganizationRole.OWNER, OrganizationRole.ORG_ADMIN);
            isOrgAdmin = true;
        } catch (AccessDeniedException ignored) {}

        if (!isOrgAdmin && !currentUserId.equals(team.getManagerId())) {
            throw new AccessDeniedException("You do not have permission to transfer manager of this team");
        }

        // New manager must be a member of organization
        securityValidation.validateOrganizationAccess(team.getOrganizationId(), newManagerId);

        // Assign new manager to team if not already a member
        assignMemberInternal(team.getId(), newManagerId, "MANAGER");

        // Update old manager's role in TeamMember to MEMBER
        if (team.getManagerId() != null) {
            teamMemberRepository.findByTeamIdAndUserId(team.getId(), team.getManagerId())
                    .ifPresent(oldMgr -> {
                        oldMgr.setRole("MEMBER");
                        teamMemberRepository.save(oldMgr);
                    });
        }

        team.setManagerId(newManagerId);
        logInfo("Team manager for team " + team.getId() + " transferred to " + newManagerId);
    }

    private void validateTeamModificationAccess(Team team, String userId) {
        boolean isOrgAdmin = false;
        try {
            securityValidation.validateOrganizationAccess(team.getOrganizationId(), userId, OrganizationRole.OWNER, OrganizationRole.ORG_ADMIN);
            isOrgAdmin = true;
        } catch (AccessDeniedException ignored) {}

        if (!isOrgAdmin && !userId.equals(team.getManagerId())) {
            throw new AccessDeniedException("Only a team manager or org administrator can modify team membership");
        }
    }
}
