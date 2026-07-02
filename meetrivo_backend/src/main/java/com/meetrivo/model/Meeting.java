package com.meetrivo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "meetings")
public class Meeting {

    @Id
    private String id;

    @Indexed(unique = true)
    private String meetingId;  // UUID-based unique ID

    @Indexed(unique = true)
    private String meetingCode; // e.g. MTR-583920

    private String title;
    private String description;

    private String hostId;
    private String hostName;

    @Builder.Default
    private MeetingStatus status = MeetingStatus.SCHEDULED;

    @Builder.Default
    private MeetingVisibility visibility = MeetingVisibility.PUBLIC;

    @Builder.Default
    private boolean passwordProtected = false;
    private String meetingPassword;

    @Builder.Default
    private boolean scheduled = false;
    private LocalDateTime scheduledStartTime;
    private LocalDateTime scheduledEndTime;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;

    @Builder.Default
    private int maxParticipants = 100;

    @Builder.Default
    private int participantCount = 0;

    // Feature flags
    @Builder.Default
    private boolean waitingRoomEnabled = false;

    @Builder.Default
    private boolean locked = false;

    @Builder.Default
    private boolean recordingEnabled = false;

    @Builder.Default
    private boolean chatEnabled = true;

    @Builder.Default
    private boolean screenShareEnabled = true;

    @Builder.Default
    private SharePermission sharePermission = SharePermission.ALL_PARTICIPANTS;

    // Shareable link
    private String joinLink;

    // QR fields
    private String qrToken;
    private LocalDateTime qrExpiresAt;

    // Tenant and isolation fields
    private String organizationId;
    private String teamId;
    private String departmentId;

    @Builder.Default
    private MeetingScope meetingScope = MeetingScope.PUBLIC;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
