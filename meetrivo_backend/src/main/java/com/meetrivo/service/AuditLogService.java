package com.meetrivo.service;

import com.meetrivo.model.AuditLog;
import com.meetrivo.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService extends BaseService {

    private final AuditLogRepository auditLogRepository;

    public AuditLog logAction(String action, String performedBy, String targetId, String targetType, String details) {
        AuditLog auditLog = AuditLog.builder()
                .action(action)
                .performedBy(performedBy)
                .targetId(targetId)
                .targetType(targetType)
                .timestamp(LocalDateTime.now())
                .details(details)
                .build();
        
        AuditLog saved = auditLogRepository.save(auditLog);
        logInfo("Audit Log created: " + action + " by " + performedBy);
        return saved;
    }

    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findByOrderByTimestampDesc();
    }

    public AuditLog getLogById(String id) {
        return auditLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Audit log not found: " + id));
    }
}
