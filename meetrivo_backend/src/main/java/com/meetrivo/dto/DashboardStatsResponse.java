package com.meetrivo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalUsers;
    private long activeUsers;
    private long totalMeetings;
    private long liveMeetings;
    private long totalRecordings;
    private long totalInvitations;
    private long totalNotifications;
}
