package com.meetrivo.service;

import com.meetrivo.dto.InviteMemberRequest;
import com.meetrivo.dto.OrganizationRequest;
import com.meetrivo.dto.OrganizationAnalyticsResponse;
import com.meetrivo.model.*;
import com.meetrivo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganizationService extends BaseService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final OrganizationInvitationRepository organizationInvitationRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final DepartmentRepository departmentRepository;
    private final SecurityValidationService securityValidation;
    private final MeetingRepository meetingRepository;
    private final MeetingRecordingRepository meetingRecordingRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public Organization createOrganization(OrganizationRequest request, String currentUserId) {
        // Create the new Owner User
        if (userRepository.existsByEmail(request.getOwnerEmail())) {
            throw new RuntimeException("An account with the owner email already exists");
        }
        
        String username = request.getOwnerEmail().split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 8);
        
        User owner = User.builder()
                .email(request.getOwnerEmail())
                .username(username)
                .fullName(request.getOwnerName() != null ? request.getOwnerName() : username)
                .password(passwordEncoder.encode(request.getTemporaryPassword()))
                .role(Role.ORGANIZATION_OWNER)
                .accountStatus(AccountStatus.ACTIVE)
                .emailVerified(true)
                .build();
        
        User savedOwner = userRepository.save(owner);

        String slug = generateUniqueSlug(request.getName());

        Organization org = Organization.builder()
                .name(request.getName())
                .description(request.getDescription())
                .logo(request.getLogo())
                .domain(request.getDomain())
                .slug(slug)
                .ownerId(savedOwner.getId())
                .phone(request.getPhone())
                .industry(request.getIndustry())
                .companySize(request.getCompanySize())
                .country(request.getCountry())
                .timezone(request.getTimezone())
                .status(OrganizationStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Organization savedOrg = organizationRepository.save(org);

        // Add owner as a member. The Super Admin (currentUserId) is intentionally NOT added.
        OrganizationMember member = OrganizationMember.builder()
                .organizationId(savedOrg.getId())
                .userId(savedOwner.getId())
                .role(OrganizationRole.OWNER)
                .joinedAt(LocalDateTime.now())
                .build();
        organizationMemberRepository.save(member);

        logInfo("Organization created: " + savedOrg.getName() + " and owner account created for: " + request.getOwnerEmail());
        return savedOrg;
    }

    public Organization updateOrganization(String id, OrganizationRequest request, String currentUserId) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        // Validate that current user is OWNER or ORG_ADMIN
        securityValidation.validateOrganizationAccess(id, currentUserId, OrganizationRole.OWNER, OrganizationRole.ORG_ADMIN);

        org.setName(request.getName());
        org.setDescription(request.getDescription());
        org.setLogo(request.getLogo());
        org.setDomain(request.getDomain());
        if (request.getPhone() != null) org.setPhone(request.getPhone());
        if (request.getIndustry() != null) org.setIndustry(request.getIndustry());
        if (request.getCompanySize() != null) org.setCompanySize(request.getCompanySize());
        if (request.getCountry() != null) org.setCountry(request.getCountry());
        if (request.getTimezone() != null) org.setTimezone(request.getTimezone());
        org.setUpdatedAt(LocalDateTime.now());

        Organization updatedOrg = organizationRepository.save(org);
        logInfo("Organization updated: " + updatedOrg.getName());
        return updatedOrg;
    }

    public void deleteOrganization(String id, String currentUserId) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        // Only owner can delete organization
        if (!org.getOwnerId().equals(currentUserId)) {
            throw new AccessDeniedException("Only the owner can delete the organization");
        }

        // Delete members
        List<OrganizationMember> members = organizationMemberRepository.findByOrganizationId(id);
        organizationMemberRepository.deleteAll(members);

        // Delete invitations
        List<OrganizationInvitation> invitations = organizationInvitationRepository.findByOrganizationId(id);
        organizationInvitationRepository.deleteAll(invitations);

        // Delete teams and team members
        List<Team> teams = teamRepository.findByOrganizationId(id);
        for (Team team : teams) {
            List<TeamMember> teamMembers = teamMemberRepository.findByTeamId(team.getId());
            teamMemberRepository.deleteAll(teamMembers);
        }
        teamRepository.deleteAll(teams);

        // Delete departments
        List<Department> departments = departmentRepository.findByOrganizationId(id);
        departmentRepository.deleteAll(departments);

        // Delete organization itself
        organizationRepository.delete(org);
        logInfo("Organization deleted: " + org.getName());
    }

    public OrganizationInvitation inviteMember(String orgId, InviteMemberRequest request, String currentUserId) {
        // Validate sender is OWNER or ORG_ADMIN
        securityValidation.validateOrganizationAccess(orgId, currentUserId, OrganizationRole.OWNER, OrganizationRole.ORG_ADMIN);

        // Check if user is already a member
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            boolean isMember = organizationMemberRepository.existsByOrganizationIdAndUserId(orgId, userOpt.get().getId());
            if (isMember) {
                throw new RuntimeException("User is already a member of this organization");
            }
        }

        // Check if there is already a pending invitation
        boolean hasPending = organizationInvitationRepository.existsByOrganizationIdAndEmailAndStatus(
                orgId, request.getEmail(), InvitationStatus.PENDING
        );
        if (hasPending) {
            throw new RuntimeException("A pending invitation already exists for this email");
        }

        OrganizationInvitation invitation = OrganizationInvitation.builder()
                .organizationId(orgId)
                .email(request.getEmail())
                .role(request.getRole() != null ? request.getRole() : OrganizationRole.MEMBER)
                .status(InvitationStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();

        OrganizationInvitation savedInvitation = organizationInvitationRepository.save(invitation);
        logInfo("Member invited: " + request.getEmail() + " to organization: " + orgId);
        return savedInvitation;
    }

    public void removeMember(String orgId, String memberUserId, String currentUserId) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        // If target is the owner, they cannot be removed (must delete organization or transfer ownership)
        if (org.getOwnerId().equals(memberUserId)) {
            throw new RuntimeException("Cannot remove the organization owner");
        }

        // Caller must be OWNER or ORG_ADMIN. If target is admin, caller must be owner.
        OrganizationMember callerMember = securityValidation.validateOrganizationAccess(orgId, currentUserId);
        OrganizationMember targetMember = organizationMemberRepository.findByOrganizationIdAndUserId(orgId, memberUserId)
                .orElseThrow(() -> new RuntimeException("User is not a member of this organization"));

        if (targetMember.getRole() == OrganizationRole.OWNER) {
            throw new RuntimeException("Cannot remove the owner of organization");
        }

        if (targetMember.getRole() == OrganizationRole.ORG_ADMIN && callerMember.getRole() != OrganizationRole.OWNER) {
            throw new AccessDeniedException("Only the owner can remove an admin");
        }

        if (callerMember.getRole() != OrganizationRole.OWNER && callerMember.getRole() != OrganizationRole.ORG_ADMIN && !currentUserId.equals(memberUserId)) {
            throw new AccessDeniedException("You do not have permission to remove this member");
        }

        // Remove from teams
        List<Team> teams = teamRepository.findByOrganizationId(orgId);
        for (Team team : teams) {
            teamMemberRepository.deleteByTeamIdAndUserId(team.getId(), memberUserId);
            // If they are manager, set managerId to null
            if (memberUserId.equals(team.getManagerId())) {
                team.setManagerId(null);
                teamRepository.save(team);
            }
        }

        // Remove from departments
        List<Department> departments = departmentRepository.findByOrganizationId(orgId);
        for (Department dept : departments) {
            if (dept.getMemberIds() != null && dept.getMemberIds().contains(memberUserId)) {
                dept.getMemberIds().remove(memberUserId);
                departmentRepository.save(dept);
            }
            if (memberUserId.equals(dept.getHeadId())) {
                dept.setHeadId(null);
                departmentRepository.save(dept);
            }
        }

        // Remove organization membership
        organizationMemberRepository.delete(targetMember);
        logInfo("Member " + memberUserId + " removed from organization: " + orgId);
    }

    public void acceptInvitation(String invitationId, String currentUserId) {
        OrganizationInvitation invitation = organizationInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new RuntimeException("Invitation is not pending");
        }

        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            organizationInvitationRepository.save(invitation);
            throw new RuntimeException("Invitation has expired");
        }

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getEmail().equalsIgnoreCase(invitation.getEmail())) {
            throw new AccessDeniedException("Invitation was sent to a different email address");
        }

        // Create member
        OrganizationMember member = OrganizationMember.builder()
                .organizationId(invitation.getOrganizationId())
                .userId(currentUserId)
                .role(invitation.getRole())
                .joinedAt(LocalDateTime.now())
                .build();

        organizationMemberRepository.save(member);

        invitation.setStatus(InvitationStatus.ACCEPTED);
        organizationInvitationRepository.save(invitation);

        logInfo("Invitation accepted. User: " + currentUserId + " joined organization: " + invitation.getOrganizationId());
    }

    public void declineInvitation(String invitationId, String currentUserId) {
        OrganizationInvitation invitation = organizationInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new RuntimeException("Invitation is not pending");
        }

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getEmail().equalsIgnoreCase(invitation.getEmail())) {
            throw new AccessDeniedException("Invitation was sent to a different email address");
        }

        invitation.setStatus(InvitationStatus.DECLINED);
        organizationInvitationRepository.save(invitation);

        logInfo("Invitation declined. User: " + currentUserId + " declined organization: " + invitation.getOrganizationId());
    }

    public Organization getOrganization(String id) {
        return organizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
    }

    public List<Organization> getMyOrganizations(String userId) {
        // Super Admins can see all organizations for management purposes
        User user = userRepository.findById(userId).orElse(null);
        if (user != null && user.getRole() == Role.SUPER_ADMIN) {
            return organizationRepository.findAll();
        }

        List<OrganizationMember> memberships = organizationMemberRepository.findByUserId(userId);
        List<String> orgIds = memberships.stream()
                .map(OrganizationMember::getOrganizationId)
                .collect(Collectors.toList());

        return organizationRepository.findAllById(orgIds);
    }

    public List<OrganizationMember> getOrganizationMembers(String orgId) {
        List<OrganizationMember> members = organizationMemberRepository.findByOrganizationId(orgId);
        for (OrganizationMember member : members) {
            userRepository.findById(member.getUserId()).ifPresent(user -> {
                member.setFullName(user.getFullName());
                member.setEmail(user.getEmail());
                member.setUsername(user.getUsername());
            });
        }
        return members;
    }

    public List<Team> getOrganizationTeams(String orgId) {
        return teamRepository.findByOrganizationId(orgId);
    }

    public List<Department> getOrganizationDepartments(String orgId) {
        return departmentRepository.findByOrganizationId(orgId);
    }

    public OrganizationAnalyticsResponse getOrganizationAnalytics(String orgId, String currentUserId) {
        // Validate user belongs to organization
        securityValidation.validateOrganizationAccess(orgId, currentUserId);

        long totalMembers = organizationMemberRepository.countByOrganizationId(orgId);

        List<OrganizationMember> members = organizationMemberRepository.findByOrganizationId(orgId);
        List<String> memberUserIds = members.stream()
                .map(OrganizationMember::getUserId)
                .collect(Collectors.toList());

        long activeMembers = 0;
        if (!memberUserIds.isEmpty()) {
            activeMembers = userRepository.findAllById(memberUserIds).stream()
                    .filter(u -> u.getAccountStatus() == AccountStatus.ACTIVE)
                    .count();
        }

        long teamsCount = teamRepository.countByOrganizationId(orgId);
        long departmentsCount = departmentRepository.countByOrganizationId(orgId);

        List<Meeting> meetings = meetingRepository.findByOrganizationId(orgId);
        long meetingsCount = meetings.size();

        double meetingHours = 0.0;
        for (Meeting m : meetings) {
            if (m.getActualStartTime() != null) {
                LocalDateTime end = m.getActualEndTime() != null ? m.getActualEndTime() : LocalDateTime.now();
                long minutes = java.time.Duration.between(m.getActualStartTime(), end).toMinutes();
                meetingHours += minutes / 60.0;
            } else if (m.getScheduledStartTime() != null && m.getScheduledEndTime() != null) {
                long minutes = java.time.Duration.between(m.getScheduledStartTime(), m.getScheduledEndTime()).toMinutes();
                meetingHours += minutes / 60.0;
            }
        }

        double recordingUsageBytes = 0.0;
        if (!meetings.isEmpty()) {
            List<String> meetingIds = meetings.stream()
                    .map(Meeting::getMeetingId)
                    .collect(Collectors.toList());
            List<MeetingRecording> recordings = meetingRecordingRepository.findByMeetingIdIn(meetingIds);
            for (MeetingRecording r : recordings) {
                if (r.getFileSize() != null) {
                    recordingUsageBytes += r.getFileSize();
                }
            }
        }

        double recordingUsageMb = recordingUsageBytes / (1024.0 * 1024.0);
        // Storage usage is recording usage plus metadata (e.g. 10MB default base for organization data)
        double storageUsageMb = recordingUsageMb + 10.0;

        // Count active meetings (status = ACTIVE)
        long activeMeetings = meetings.stream()
                .filter(m -> m.getStatus() == com.meetrivo.model.MeetingStatus.ACTIVE)
                .count();

        long storageUsedBytes = (long)(storageUsageMb * 1024.0 * 1024.0);

        return OrganizationAnalyticsResponse.builder()
                .totalMembers(totalMembers)
                .activeMembers(activeMembers)
                .onlineMembers(activeMembers) // approximate online with active accounts
                .teamsCount(teamsCount)
                .departmentsCount(departmentsCount)
                .meetingsCount(meetingsCount)
                .activeMeetings(activeMeetings)
                .meetingHours(Math.round(meetingHours * 100.0) / 100.0)
                .recordingUsageMb(Math.round(recordingUsageMb * 100.0) / 100.0)
                .storageUsageMb(Math.round(storageUsageMb * 100.0) / 100.0)
                .storageUsedBytes(storageUsedBytes)
                .planType("Pro")
                .build();
    }

    private String generateUniqueSlug(String name) {
        String baseSlug = name.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", "-");
        if (baseSlug.isEmpty()) {
            baseSlug = "org";
        }
        String slug = baseSlug;
        int count = 1;
        while (organizationRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + count;
            count++;
        }
        return slug;
    }
}
