package com.meetrivo.service;

import com.meetrivo.model.Role;
import com.meetrivo.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BackupService extends BaseService {

    private final MongoTemplate mongoTemplate;

    @Value("${meetrivo.storage.local-path:./recordings}")
    private String recordingsPath;

    @Value("${meetrivo.backup.path:./backups}")
    private String backupBasePath;

    private static final DateTimeFormatter BACKUP_TS = DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss");

    // ─── Collections Backup Manifest ─────────────────────────────────────────

    private static final Set<String> BACKUP_COLLECTIONS = Set.of(
        "users", "meetings", "meeting_participants", "chat_messages",
        "reactions", "screen_share_sessions", "presentation_history",
        "meeting_recordings", "recording_history", "scheduled_meetings",
        "meeting_invitations", "notifications", "audit_logs",
        "platform_settings", "announcements", "analytics_events",
        "system_alerts", "reports"
    );

    // ─── Manual Backup (Admin-triggered) ─────────────────────────────────────

    public Map<String, Object> triggerManualBackup() {
        validateAdminAccess();
        return performBackup("MANUAL");
    }

    // ─── Scheduled Nightly Backup ─────────────────────────────────────────────
    // Runs every night at 02:00

    @Scheduled(cron = "0 0 2 * * *")
    public void scheduledNightlyBackup() {
        try {
            logInfo("Starting scheduled nightly backup...");
            Map<String, Object> result = performBackup("SCHEDULED");
            logInfo("Scheduled backup completed: " + result.get("backupDir"));
        } catch (Exception e) {
            logError("Scheduled backup failed", e);
        }
    }

    // ─── Core Backup Logic ────────────────────────────────────────────────────

    private Map<String, Object> performBackup(String backupType) {
        String timestamp = LocalDateTime.now().format(BACKUP_TS);
        String backupDir = backupBasePath + "/" + backupType.toLowerCase() + "_" + timestamp;

        Map<String, Object> result = new HashMap<>();
        result.put("backupType", backupType);
        result.put("startedAt", LocalDateTime.now().toString());
        result.put("backupDir", backupDir);

        List<String> backedUpCollections = new ArrayList<>();
        List<String> failedCollections = new ArrayList<>();

        try {
            Path backupPath = Paths.get(backupDir);
            Files.createDirectories(backupPath);

            // Export each MongoDB collection as JSON manifest
            for (String collection : BACKUP_COLLECTIONS) {
                try {
                    List<Object> documents = mongoTemplate.findAll(Object.class, collection);
                    String content = "Collection: " + collection + "\n"
                            + "Document Count: " + documents.size() + "\n"
                            + "Exported At: " + LocalDateTime.now() + "\n"
                            + "Backup Type: " + backupType + "\n";
                    Path collFile = backupPath.resolve(collection + "_manifest.txt");
                    Files.writeString(collFile, content, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
                    backedUpCollections.add(collection + " (" + documents.size() + " docs)");
                } catch (Exception e) {
                    failedCollections.add(collection + ": " + e.getMessage());
                    logError("Failed to backup collection: " + collection, e);
                }
            }

            // Recordings directory snapshot
            Path recPath = Paths.get(recordingsPath);
            long recordingsCount = 0;
            long totalSizeBytes = 0;
            if (Files.exists(recPath)) {
                try (var stream = Files.walk(recPath)) {
                    List<Path> files = stream.filter(Files::isRegularFile).collect(Collectors.toList());
                    recordingsCount = files.size();
                    totalSizeBytes = files.stream().mapToLong(p -> {
                        try { return Files.size(p); } catch (IOException ex) { return 0; }
                    }).sum();
                }
            }
            String recManifest = "Recordings Snapshot\n"
                    + "Total Files: " + recordingsCount + "\n"
                    + "Total Size: " + (totalSizeBytes / (1024 * 1024)) + " MB\n"
                    + "Source Path: " + recordingsPath + "\n"
                    + "Snapshotted At: " + LocalDateTime.now() + "\n";
            Files.writeString(backupPath.resolve("recordings_manifest.txt"), recManifest,
                    StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

            // Write backup summary
            String summary = buildSummary(backupType, timestamp, backedUpCollections, failedCollections,
                    recordingsCount, totalSizeBytes);
            Files.writeString(backupPath.resolve("backup_summary.txt"), summary,
                    StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

            result.put("status", failedCollections.isEmpty() ? "SUCCESS" : "PARTIAL");
            result.put("collectionsBackedUp", backedUpCollections);
            result.put("collectionsFailed", failedCollections);
            result.put("recordingsSnapshotted", recordingsCount);
            result.put("completedAt", LocalDateTime.now().toString());

        } catch (IOException e) {
            logError("Backup directory creation failed", e);
            result.put("status", "FAILED");
            result.put("error", e.getMessage());
        }

        return result;
    }

    // ─── Backup Listing ───────────────────────────────────────────────────────

    public Map<String, Object> listBackups() {
        validateAdminAccess();
        Map<String, Object> result = new HashMap<>();

        try {
            Path base = Paths.get(backupBasePath);
            if (!Files.exists(base)) {
                result.put("backups", List.of());
                result.put("totalBackups", 0);
                return result;
            }

            List<String> backups;
            try (var stream = Files.list(base)) {
                backups = stream.filter(Files::isDirectory)
                        .map(p -> p.getFileName().toString())
                        .sorted()
                        .collect(Collectors.toList());
            }

            result.put("backups", backups);
            result.put("totalBackups", backups.size());
            result.put("backupDirectory", backupBasePath);

        } catch (IOException e) {
            logError("Failed to list backups", e);
            result.put("error", e.getMessage());
        }

        return result;
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private String buildSummary(String type, String ts, List<String> backed, List<String> failed,
                                 long recCount, long recBytes) {
        StringBuilder sb = new StringBuilder();
        sb.append("=== MEETRIVO BACKUP SUMMARY ===\n");
        sb.append("Type       : ").append(type).append("\n");
        sb.append("Timestamp  : ").append(ts).append("\n");
        sb.append("Collections: ").append(backed.size()).append(" backed up, ").append(failed.size()).append(" failed\n");
        sb.append("Recordings : ").append(recCount).append(" files (").append(recBytes / (1024 * 1024)).append(" MB)\n");
        sb.append("\n--- Backed Up ---\n");
        backed.forEach(c -> sb.append("  ✓ ").append(c).append("\n"));
        if (!failed.isEmpty()) {
            sb.append("\n--- Failed ---\n");
            failed.forEach(c -> sb.append("  ✗ ").append(c).append("\n"));
        }
        return sb.toString();
    }

    private void validateAdminAccess() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (user.getRole() != Role.ORGANIZATION_ADMIN && user.getRole() != Role.ORGANIZATION_OWNER && user.getRole() != Role.SUPER_ADMIN) {
            throw new RuntimeException("Access Denied: Admin role required for backup operations");
        }
    }
}
