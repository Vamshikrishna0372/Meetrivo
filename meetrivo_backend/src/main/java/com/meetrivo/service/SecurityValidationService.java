package com.meetrivo.service;

import com.meetrivo.model.*;
import com.meetrivo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SecurityValidationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final DepartmentRepository departmentRepository;

    /**
     * Validates if a user belongs to an organization and optionally has one of the required roles.
     */
    public OrganizationMember validateOrganizationAccess(String organizationId, String userId, OrganizationRole... requiredRoles) {
        OrganizationMember member = organizationMemberRepository.findByOrganizationIdAndUserId(organizationId, userId)
                .orElseThrow(() -> new AccessDeniedException("User is not a member of organization " + organizationId));

        if (requiredRoles != null && requiredRoles.length > 0) {
            boolean hasRole = Arrays.asList(requiredRoles).contains(member.getRole());
            if (!hasRole) {
                throw new AccessDeniedException("Required role not met for organization access");
            }
        }
        return member;
    }

    /**
     * Validates if a user has access to a team.
     * The user must either be:
     * - The team manager
     * - A member of the team
     * - An Org Owner or Org Admin of the team's organization
     */
    public void validateTeamAccess(String teamId, String userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        // Check if user is Org Admin/Owner
        Optional<OrganizationMember> orgMemberOpt = organizationMemberRepository.findByOrganizationIdAndUserId(team.getOrganizationId(), userId);
        if (orgMemberOpt.isPresent()) {
            OrganizationRole role = orgMemberOpt.get().getRole();
            if (role == OrganizationRole.OWNER || role == OrganizationRole.ORG_ADMIN) {
                return; // Org Owner/Admin has global access
            }
        }

        // Check team manager
        if (userId.equals(team.getManagerId())) {
            return;
        }

        // Check team membership
        boolean isTeamMember = teamMemberRepository.existsByTeamIdAndUserId(teamId, userId);
        if (!isTeamMember) {
            throw new AccessDeniedException("User does not have access to team " + teamId);
        }
    }

    /**
     * Validates if a user has access to a department.
     * The user must either be:
     * - The department head
     * - A member of the department
     * - An Org Owner or Org Admin of the department's organization
     */
    public void validateDepartmentAccess(String departmentId, String userId) {
        Department dept = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        // Check Org Admin/Owner
        Optional<OrganizationMember> orgMemberOpt = organizationMemberRepository.findByOrganizationIdAndUserId(dept.getOrganizationId(), userId);
        if (orgMemberOpt.isPresent()) {
            OrganizationRole role = orgMemberOpt.get().getRole();
            if (role == OrganizationRole.OWNER || role == OrganizationRole.ORG_ADMIN) {
                return;
            }
        }

        // Check head
        if (userId.equals(dept.getHeadId())) {
            return;
        }

        // Check member
        if (dept.getMemberIds() != null && dept.getMemberIds().contains(userId)) {
            return;
        }

        throw new AccessDeniedException("User does not have access to department " + departmentId);
    }

    /**
     * Validates meeting scope access for a user.
     */
    public void validateMeetingScopeAccess(Meeting meeting, String userId) {
        if (meeting.getMeetingScope() == null || meeting.getMeetingScope() == MeetingScope.PUBLIC) {
            return;
        }

        // Host always has access
        if (userId.equals(meeting.getHostId())) {
            return;
        }

        if (meeting.getMeetingScope() == MeetingScope.PRIVATE) {
            throw new AccessDeniedException("Meeting is private");
        }

        if (meeting.getMeetingScope() == MeetingScope.ORGANIZATION) {
            if (meeting.getOrganizationId() == null) {
                throw new AccessDeniedException("Meeting has no organization ID associated");
            }
            validateOrganizationAccess(meeting.getOrganizationId(), userId);
            return;
        }

        if (meeting.getMeetingScope() == MeetingScope.TEAM) {
            if (meeting.getTeamId() == null) {
                throw new AccessDeniedException("Meeting has no team ID associated");
            }
            validateTeamAccess(meeting.getTeamId(), userId);
            return;
        }

        if (meeting.getMeetingScope() == MeetingScope.DEPARTMENT) {
            if (meeting.getDepartmentId() == null) {
                throw new AccessDeniedException("Meeting has no department ID associated");
            }
            validateDepartmentAccess(meeting.getDepartmentId(), userId);
        }
    }
}
