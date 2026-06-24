package com.meetrivo.service;

import com.meetrivo.dto.DepartmentRequest;
import com.meetrivo.model.Department;
import com.meetrivo.model.OrganizationRole;
import com.meetrivo.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService extends BaseService {

    private final DepartmentRepository departmentRepository;
    private final SecurityValidationService securityValidation;

    public Department createDepartment(DepartmentRequest request, String currentUserId) {
        // Only OWNER or ORG_ADMIN can create departments
        securityValidation.validateOrganizationAccess(request.getOrganizationId(), currentUserId, OrganizationRole.OWNER, OrganizationRole.ORG_ADMIN);

        Department dept = Department.builder()
                .organizationId(request.getOrganizationId())
                .name(request.getName())
                .description(request.getDescription())
                .headId(request.getHeadId())
                .memberIds(new ArrayList<>())
                .build();

        if (request.getHeadId() != null) {
            dept.getMemberIds().add(request.getHeadId());
        }

        Department savedDept = departmentRepository.save(dept);
        logInfo("Department created: " + savedDept.getName() + " in organization: " + savedDept.getOrganizationId());
        return savedDept;
    }

    public Department updateDepartment(String id, DepartmentRequest request, String currentUserId) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        // Caller must be OWNER, ORG_ADMIN, or head of department
        boolean isOrgAdmin = false;
        try {
            securityValidation.validateOrganizationAccess(dept.getOrganizationId(), currentUserId, OrganizationRole.OWNER, OrganizationRole.ORG_ADMIN);
            isOrgAdmin = true;
        } catch (AccessDeniedException ignored) {}

        if (!isOrgAdmin && !currentUserId.equals(dept.getHeadId())) {
            throw new AccessDeniedException("You do not have permission to update this department");
        }

        dept.setName(request.getName());
        dept.setDescription(request.getDescription());
        
        if (request.getHeadId() != null && !request.getHeadId().equals(dept.getHeadId())) {
            // Validate new head belongs to organization
            securityValidation.validateOrganizationAccess(dept.getOrganizationId(), request.getHeadId());
            dept.setHeadId(request.getHeadId());
            if (!dept.getMemberIds().contains(request.getHeadId())) {
                dept.getMemberIds().add(request.getHeadId());
            }
        }

        Department updatedDept = departmentRepository.save(dept);
        logInfo("Department updated: " + updatedDept.getName());
        return updatedDept;
    }

    public void deleteDepartment(String id, String currentUserId) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        // Only OWNER or ORG_ADMIN can delete departments
        securityValidation.validateOrganizationAccess(dept.getOrganizationId(), currentUserId, OrganizationRole.OWNER, OrganizationRole.ORG_ADMIN);

        departmentRepository.delete(dept);
        logInfo("Department deleted: " + dept.getName());
    }

    public Department assignHead(String deptId, String headId, String currentUserId) {
        Department dept = departmentRepository.findById(deptId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        // Only OWNER or ORG_ADMIN can assign head
        securityValidation.validateOrganizationAccess(dept.getOrganizationId(), currentUserId, OrganizationRole.OWNER, OrganizationRole.ORG_ADMIN);

        // Validate new head belongs to organization
        securityValidation.validateOrganizationAccess(dept.getOrganizationId(), headId);

        dept.setHeadId(headId);
        if (!dept.getMemberIds().contains(headId)) {
            dept.getMemberIds().add(headId);
        }

        Department updatedDept = departmentRepository.save(dept);
        logInfo("Department head assigned: " + headId + " for department " + deptId);
        return updatedDept;
    }

    public Department assignMembers(String deptId, List<String> memberIds, String currentUserId) {
        Department dept = departmentRepository.findById(deptId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        // Caller must be OWNER, ORG_ADMIN, or head of department
        boolean isOrgAdmin = false;
        try {
            securityValidation.validateOrganizationAccess(dept.getOrganizationId(), currentUserId, OrganizationRole.OWNER, OrganizationRole.ORG_ADMIN);
            isOrgAdmin = true;
        } catch (AccessDeniedException ignored) {}

        if (!isOrgAdmin && !currentUserId.equals(dept.getHeadId())) {
            throw new AccessDeniedException("You do not have permission to assign members to this department");
        }

        // Validate all memberIds belong to the organization
        for (String memberId : memberIds) {
            securityValidation.validateOrganizationAccess(dept.getOrganizationId(), memberId);
        }

        // Update list
        dept.setMemberIds(new ArrayList<>(memberIds));
        
        // Ensure headId is in member list if present
        if (dept.getHeadId() != null && !dept.getMemberIds().contains(dept.getHeadId())) {
            dept.getMemberIds().add(dept.getHeadId());
        }

        Department updatedDept = departmentRepository.save(dept);
        logInfo("Department members updated for department " + deptId);
        return updatedDept;
    }

    public Department getDepartment(String id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));
    }

    public List<Department> getDepartmentsByOrganization(String orgId) {
        return departmentRepository.findByOrganizationId(orgId);
    }
}
