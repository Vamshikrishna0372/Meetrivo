package com.meetrivo.dto;

import com.meetrivo.model.MeetingStatus;
import com.meetrivo.model.MeetingVisibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MeetingResponse {
    private String id;
    private String meetingId;
    private String meetingCode;
    private String title;
    private String description;
    private String hostId;
    private String hostName;
    private MeetingStatus status;
    private MeetingVisibility visibility;
    private boolean passwordProtected;
    private boolean scheduled;
    private LocalDateTime scheduledStartTime;
    private LocalDateTime scheduledEndTime;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    private int maxParticipants;
    private int participantCount;
    private boolean waitingRoomEnabled;
    private boolean locked;
    private boolean recordingEnabled;
    private boolean chatEnabled;
    private boolean screenShareEnabled;
    private String joinLink;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
