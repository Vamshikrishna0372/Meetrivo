package com.meetrivo.repository;

import com.meetrivo.model.InvitationStatus;
import com.meetrivo.model.OrganizationInvitation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationInvitationRepository extends MongoRepository<OrganizationInvitation, String> {
    Optional<OrganizationInvitation> findByOrganizationIdAndEmail(String organizationId, String email);
    List<OrganizationInvitation> findByOrganizationId(String organizationId);
    List<OrganizationInvitation> findByEmail(String email);
    boolean existsByOrganizationIdAndEmailAndStatus(String organizationId, String email, InvitationStatus status);
}
