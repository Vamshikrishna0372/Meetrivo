package com.meetrivo.dto;

import com.meetrivo.model.ParticipantRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ParticipantResponse {
    private String id;
    private String meetingId;
    private String userId;
    private String username;
    private String displayName;
    private ParticipantRole role;
    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;
    private boolean isMuted;
    private boolean isCameraEnabled;
    private boolean isScreenSharing;
    private boolean isActive;
    private boolean isApproved;
    private boolean isBanned;
}
