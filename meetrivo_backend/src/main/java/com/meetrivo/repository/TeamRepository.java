package com.meetrivo.repository;

import com.meetrivo.model.Team;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRepository extends MongoRepository<Team, String> {
    List<Team> findByOrganizationId(String organizationId);
    long countByOrganizationId(String organizationId);
}
