package com.meetrivo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrganizationAnalyticsResponse {
    private long totalMembers;
    private long activeMembers;
    private long onlineMembers;
    private long teamsCount;
    private long departmentsCount;
    private long meetingsCount;
    private long activeMeetings;
    private double meetingHours;
    private double recordingUsageMb;
    private double storageUsageMb;
    private long storageUsedBytes;
    private String planType;
}
