package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.dto.DepartmentRequest;
import com.meetrivo.model.Department;
import com.meetrivo.model.User;
import com.meetrivo.service.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
@Tag(name = "Department Management", description = "Endpoints for managing departments and their heads or members")
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping
    @Operation(summary = "Create Department", description = "Creates a new department in an organization")
    public ApiResponse<Department> createDepartment(@Valid @RequestBody DepartmentRequest request) {
        return ApiResponse.success(departmentService.createDepartment(request, getCurrentUserId()), "Department created successfully");
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Department", description = "Updates details of a department")
    public ApiResponse<Department> updateDepartment(@PathVariable String id, @Valid @RequestBody DepartmentRequest request) {
        return ApiResponse.success(departmentService.updateDepartment(id, request, getCurrentUserId()), "Department updated successfully");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Department", description = "Deletes a department")
    public ApiResponse<Void> deleteDepartment(@PathVariable String id) {
        departmentService.deleteDepartment(id, getCurrentUserId());
        return ApiResponse.success(null, "Department deleted successfully");
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Department by ID", description = "Retrieves details of a department")
    public ApiResponse<Department> getDepartment(@PathVariable String id) {
        return ApiResponse.success(departmentService.getDepartment(id), "Department retrieved successfully");
    }

    @PutMapping("/{id}/head/{headId}")
    @Operation(summary = "Assign Department Head", description = "Assigns a head to the department")
    public ApiResponse<Department> assignHead(@PathVariable String id, @PathVariable String headId) {
        return ApiResponse.success(departmentService.assignHead(id, headId, getCurrentUserId()), "Department head assigned successfully");
    }

    @PutMapping("/{id}/members")
    @Operation(summary = "Assign Department Members", description = "Assigns members to the department")
    public ApiResponse<Department> assignMembers(@PathVariable String id, @RequestBody List<String> memberIds) {
        return ApiResponse.success(departmentService.assignMembers(id, memberIds, getCurrentUserId()), "Department members assigned successfully");
    }

    private String getCurrentUserId() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return user.getId();
    }
}
