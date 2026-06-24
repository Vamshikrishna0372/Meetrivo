package com.meetrivo.repository;

import com.meetrivo.model.Organization;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationRepository extends MongoRepository<Organization, String> {
    Optional<Organization> findBySlug(String slug);
    Optional<Organization> findByDomain(String domain);
    List<Organization> findByOwnerId(String ownerId);
    boolean existsBySlug(String slug);
}
