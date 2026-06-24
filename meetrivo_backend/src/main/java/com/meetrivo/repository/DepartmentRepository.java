package com.meetrivo.repository;

import com.meetrivo.model.Department;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartmentRepository extends MongoRepository<Department, String> {
    List<Department> findByOrganizationId(String organizationId);
    long countByOrganizationId(String organizationId);
}
