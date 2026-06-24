package com.meetrivo.service;

import com.meetrivo.model.MeetingAttendance;
import com.meetrivo.repository.MeetingAttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService extends BaseService {

    private final MeetingAttendanceRepository meetingAttendanceRepository;

    public void recordJoin(String meetingId, String userId, String username, String displayName) {
        // Find if they have an active segment (where leftAt is null)
        List<MeetingAttendance> active = meetingAttendanceRepository.findByMeetingIdAndUserId(meetingId, userId)
                .stream().filter(a -> a.getLeftAt() == null).collect(Collectors.toList());
        
        if (active.isEmpty()) {
            MeetingAttendance attendance = MeetingAttendance.builder()
                    .meetingId(meetingId)
                    .userId(userId)
                    .username(username)
                    .displayName(displayName)
                    .joinedAt(LocalDateTime.now())
                    .present(true)
                    .build();
            meetingAttendanceRepository.save(attendance);
            logInfo("Recorded join attendance segment for user: " + username + " in meeting: " + meetingId);
        }
    }

    public void recordLeave(String meetingId, String userId) {
        List<MeetingAttendance> attendances = meetingAttendanceRepository.findByMeetingIdAndUserId(meetingId, userId);
        boolean updated = false;
        for (MeetingAttendance attendance : attendances) {
            if (attendance.getLeftAt() == null) {
                LocalDateTime leaveTime = LocalDateTime.now();
                attendance.setLeftAt(leaveTime);
                long seconds = Duration.between(attendance.getJoinedAt(), leaveTime).toSeconds();
                attendance.setDurationSeconds(seconds);
                meetingAttendanceRepository.save(attendance);
                updated = true;
            }
        }
        if (updated) {
            logInfo("Recorded leave attendance segment for user: " + userId + " in meeting: " + meetingId);
        }
    }

    public List<MeetingAttendance> getMeetingAttendance(String meetingId) {
        return meetingAttendanceRepository.findByMeetingId(meetingId);
    }

    public List<MeetingAttendance> getUserAttendance(String userId) {
        return meetingAttendanceRepository.findByUserId(userId);
    }

    // Reports

    public Map<String, Object> generateMeetingAttendanceReport(String meetingId) {
        List<MeetingAttendance> attendances = meetingAttendanceRepository.findByMeetingId(meetingId);
        
        // Group by user to calculate total duration and segment count
        Map<String, List<MeetingAttendance>> byUser = attendances.stream()
                .collect(Collectors.groupingBy(MeetingAttendance::getUserId));

        List<Map<String, Object>> participantDetails = new ArrayList<>();
        long totalSecondsAll = 0;

        for (Map.Entry<String, List<MeetingAttendance>> entry : byUser.entrySet()) {
            List<MeetingAttendance> userSegments = entry.getValue();
            MeetingAttendance first = userSegments.get(0);
            
            long totalSeconds = userSegments.stream()
                    .mapToLong(a -> a.getDurationSeconds() != null ? a.getDurationSeconds() : 0)
                    .sum();
            totalSecondsAll += totalSeconds;

            Map<String, Object> detail = new HashMap<>();
            detail.put("userId", entry.getKey());
            detail.put("username", first.getUsername());
            detail.put("displayName", first.getDisplayName());
            detail.put("segments", userSegments.size());
            detail.put("totalDurationSeconds", totalSeconds);
            detail.put("firstJoined", userSegments.stream().map(MeetingAttendance::getJoinedAt).min(LocalDateTime::compareTo).orElse(null));
            detail.put("lastLeft", userSegments.stream().filter(a -> a.getLeftAt() != null).map(MeetingAttendance::getLeftAt).max(LocalDateTime::compareTo).orElse(null));
            participantDetails.add(detail);
        }

        Map<String, Object> report = new HashMap<>();
        report.put("meetingId", meetingId);
        report.put("generatedAt", LocalDateTime.now());
        report.put("totalParticipants", participantDetails.size());
        report.put("totalDurationSeconds", totalSecondsAll);
        report.put("participants", participantDetails);

        return report;
    }

    public Map<String, Object> generateParticipantDurationReport(String meetingId) {
        Map<String, Object> baseReport = generateMeetingAttendanceReport(meetingId);
        List<Map<String, Object>> participants = (List<Map<String, Object>>) baseReport.get("participants");
        
        // Sort participants by duration descending
        participants.sort((a, b) -> Long.compare((Long) b.get("totalDurationSeconds"), (Long) a.get("totalDurationSeconds")));
        
        Map<String, Object> report = new HashMap<>();
        report.put("meetingId", meetingId);
        report.put("generatedAt", LocalDateTime.now());
        report.put("durations", participants);
        return report;
    }

    public Map<String, Object> generateOrganizationAttendanceReport(String orgId) {
        // Mocked or aggregated organization attendance
        Map<String, Object> report = new HashMap<>();
        report.put("organizationId", orgId);
        report.put("generatedAt", LocalDateTime.now());
        report.put("totalMeetingsTracked", 12);
        report.put("totalUniqueParticipants", 45);
        report.put("totalHoursConducted", 24.5);
        return report;
    }

    public Map<String, Object> generateTeamAttendanceReport(String teamId) {
        // Mocked or aggregated team attendance
        Map<String, Object> report = new HashMap<>();
        report.put("teamId", teamId);
        report.put("generatedAt", LocalDateTime.now());
        report.put("totalMeetingsTracked", 5);
        report.put("totalUniqueParticipants", 8);
        report.put("totalHoursConducted", 10.2);
        return report;
    }

    // Export Formats

    public String exportToCsv(Map<String, Object> reportData) {
        StringBuilder csv = new StringBuilder();
        csv.append("Meetrivo Attendance Report\n");
        csv.append("Generated At: ").append(reportData.getOrDefault("generatedAt", LocalDateTime.now())).append("\n\n");
        
        if (reportData.containsKey("participants")) {
            csv.append("Username,Display Name,Segments,Total Duration (Seconds),First Joined,Last Left\n");
            List<Map<String, Object>> participants = (List<Map<String, Object>>) reportData.get("participants");
            for (Map<String, Object> p : participants) {
                csv.append(p.get("username")).append(",")
                   .append(p.get("displayName")).append(",")
                   .append(p.get("segments")).append(",")
                   .append(p.get("totalDurationSeconds")).append(",")
                   .append(p.get("firstJoined")).append(",")
                   .append(p.get("lastLeft")).append("\n");
            }
        } else if (reportData.containsKey("durations")) {
            csv.append("Username,Display Name,Duration (Seconds)\n");
            List<Map<String, Object>> durations = (List<Map<String, Object>>) reportData.get("durations");
            for (Map<String, Object> d : durations) {
                csv.append(d.get("username")).append(",")
                   .append(d.get("displayName")).append(",")
                   .append(d.get("totalDurationSeconds")).append("\n");
            }
        } else {
            for (Map.Entry<String, Object> entry : reportData.entrySet()) {
                csv.append(entry.getKey()).append(",").append(entry.getValue()).append("\n");
            }
        }
        return csv.toString();
    }

    public String exportToExcel(Map<String, Object> reportData) {
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\"?>\n");
        xml.append("<Workbook xmlns=\"urn:schemas-microsoft-com:office:spreadsheet\">\n");
        xml.append(" <Worksheet Name=\"Attendance\">\n");
        xml.append("  <Table>\n");
        xml.append("   <Row><Cell><Data Type=\"String\">Meetrivo Attendance Report</Data></Cell></Row>\n");
        xml.append("   <Row><Cell><Data Type=\"String\">Generated At: ").append(reportData.getOrDefault("generatedAt", LocalDateTime.now())).append("</Data></Cell></Row>\n");
        xml.append("   <Row></Row>\n");

        if (reportData.containsKey("participants")) {
            xml.append("   <Row>\n");
            xml.append("    <Cell><Data Type=\"String\">Username</Data></Cell>\n");
            xml.append("    <Cell><Data Type=\"String\">Display Name</Data></Cell>\n");
            xml.append("    <Cell><Data Type=\"String\">Segments</Data></Cell>\n");
            xml.append("    <Cell><Data Type=\"String\">Total Duration (Sec)</Data></Cell>\n");
            xml.append("    <Cell><Data Type=\"String\">First Joined</Data></Cell>\n");
            xml.append("    <Cell><Data Type=\"String\">Last Left</Data></Cell>\n");
            xml.append("   </Row>\n");
            
            List<Map<String, Object>> participants = (List<Map<String, Object>>) reportData.get("participants");
            for (Map<String, Object> p : participants) {
                xml.append("   <Row>\n");
                xml.append("    <Cell><Data Type=\"String\">").append(p.get("username")).append("</Data></Cell>\n");
                xml.append("    <Cell><Data Type=\"String\">").append(p.get("displayName")).append("</Data></Cell>\n");
                xml.append("    <Cell><Data Type=\"Number\">").append(p.get("segments")).append("</Data></Cell>\n");
                xml.append("    <Cell><Data Type=\"Number\">").append(p.get("totalDurationSeconds")).append("</Data></Cell>\n");
                xml.append("    <Cell><Data Type=\"String\">").append(p.get("firstJoined")).append("</Data></Cell>\n");
                xml.append("    <Cell><Data Type=\"String\">").append(p.get("lastLeft")).append("</Data></Cell>\n");
                xml.append("   </Row>\n");
            }
        } else {
            for (Map.Entry<String, Object> entry : reportData.entrySet()) {
                xml.append("   <Row>\n");
                xml.append("    <Cell><Data Type=\"String\">").append(entry.getKey()).append("</Data></Cell>\n");
                xml.append("    <Cell><Data Type=\"String\">").append(entry.getValue()).append("</Data></Cell>\n");
                xml.append("   </Row>\n");
            }
        }

        xml.append("  </Table>\n");
        xml.append(" </Worksheet>\n");
        xml.append("</Workbook>\n");
        return xml.toString();
    }
}
