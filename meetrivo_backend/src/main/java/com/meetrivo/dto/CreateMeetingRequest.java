package com.meetrivo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateMeetingRequest {
    private String title;
    private String description;
    private boolean scheduled;
    private LocalDateTime scheduledStartTime;
    private LocalDateTime scheduledEndTime;
    private boolean passwordProtected;
    private String meetingPassword;
    private String visibility;
    private int maxParticipants;
    private boolean waitingRoomEnabled;
    private boolean recordingEnabled;
    private boolean chatEnabled;
    private boolean screenShareEnabled;
}
