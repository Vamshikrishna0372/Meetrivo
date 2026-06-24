package com.meetrivo.repository;

import com.meetrivo.model.TeamMember;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends MongoRepository<TeamMember, String> {
    Optional<TeamMember> findByTeamIdAndUserId(String teamId, String userId);
    List<TeamMember> findByTeamId(String teamId);
    List<TeamMember> findByUserId(String userId);
    boolean existsByTeamIdAndUserId(String teamId, String userId);
    void deleteByTeamIdAndUserId(String teamId, String userId);
}
