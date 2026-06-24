package com.meetrivo.repository;

import com.meetrivo.model.MeetingTemplate;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingTemplateRepository extends MongoRepository<MeetingTemplate, String> {
    List<MeetingTemplate> findByUserId(String userId);
    List<MeetingTemplate> findByOrganizationIdAndIsOrganizationTemplate(String organizationId, boolean isOrganizationTemplate);
    List<MeetingTemplate> findByUserIdOrOrganizationId(String userId, String organizationId);
}
