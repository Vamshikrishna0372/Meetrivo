package com.meetrivo.service;

import com.meetrivo.model.MeetingTemplate;
import com.meetrivo.model.User;
import com.meetrivo.repository.MeetingTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MeetingTemplateService extends BaseService {

    private final MeetingTemplateRepository meetingTemplateRepository;

    public MeetingTemplate createTemplate(MeetingTemplate template) {
        User user = getCurrentUser();
        template.setUserId(user.getId());
        template.setCreatedAt(LocalDateTime.now());
        
        // If organization is specified, make sure it is linked correctly
        if (template.isOrganizationTemplate() && template.getOrganizationId() == null) {
            throw new RuntimeException("Organization ID is required for organization templates");
        }
        
        MeetingTemplate saved = meetingTemplateRepository.save(template);
        logInfo("Created meeting template: " + saved.getName() + " for user: " + user.getUsername());
        return saved;
    }

    public List<MeetingTemplate> getAvailableTemplates(String orgId) {
        User user = getCurrentUser();
        if (orgId != null && !orgId.trim().isEmpty()) {
            return meetingTemplateRepository.findByUserIdOrOrganizationId(user.getId(), orgId);
        }
        return meetingTemplateRepository.findByUserId(user.getId());
    }

    public MeetingTemplate getTemplate(String id) {
        return meetingTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting template not found: " + id));
    }

    public void deleteTemplate(String id) {
        User user = getCurrentUser();
        MeetingTemplate template = getTemplate(id);
        
        if (!template.getUserId().equals(user.getId())) {
            throw new RuntimeException("Only the template creator can delete this template");
        }
        
        meetingTemplateRepository.delete(template);
        logInfo("Deleted meeting template: " + id);
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
