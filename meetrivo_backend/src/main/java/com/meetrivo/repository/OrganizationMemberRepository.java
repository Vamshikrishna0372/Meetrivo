package com.meetrivo.repository;

import com.meetrivo.model.OrganizationMember;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationMemberRepository extends MongoRepository<OrganizationMember, String> {
    Optional<OrganizationMember> findByOrganizationIdAndUserId(String organizationId, String userId);
    List<OrganizationMember> findByOrganizationId(String organizationId);
    List<OrganizationMember> findByUserId(String userId);
    long countByOrganizationId(String organizationId);
    boolean existsByOrganizationIdAndUserId(String organizationId, String userId);
    void deleteByOrganizationIdAndUserId(String organizationId, String userId);
}
