package com.meetrivo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "meeting_participants")
@CompoundIndex(def = "{'meetingId': 1, 'userId': 1}", unique = true)
public class MeetingParticipant {

    @Id
    private String id;

    private String meetingId;
    private String userId;
    private String username;
    private String displayName;

    @Builder.Default
    private ParticipantRole role = ParticipantRole.PARTICIPANT;

    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;

    @Builder.Default
    private boolean isMuted = false;

    @Builder.Default
    private boolean isCameraEnabled = true;

    @Builder.Default
    private boolean isScreenSharing = false;

    @Builder.Default
    private boolean isActive = true;

    @Builder.Default
    private boolean isApproved = true;

    @Builder.Default
    private boolean isBanned = false;

    @Builder.Default
    private String onlineStatus = "OFFLINE";
}
