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
public class UpdateMeetingRequest {
    private String title;
    private String description;
    private LocalDateTime scheduledStartTime;
    private LocalDateTime scheduledEndTime;
    private String visibility;
    private int maxParticipants;
    private boolean waitingRoomEnabled;
    private boolean recordingEnabled;
    private boolean chatEnabled;
    private boolean screenShareEnabled;
}
