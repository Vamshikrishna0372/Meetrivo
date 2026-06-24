package com.meetrivo.dto;

import com.meetrivo.model.Notification;
import com.meetrivo.model.ScheduledMeeting;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private List<ScheduledMeeting> upcomingMeetings;
    private List<ScheduledMeeting> recentMeetings;
    private List<Notification> recentNotifications;
    private long unreadNotificationsCount;
    private long totalUpcomingMeetings;
}
