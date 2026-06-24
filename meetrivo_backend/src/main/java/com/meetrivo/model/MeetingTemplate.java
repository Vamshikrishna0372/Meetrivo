package com.meetrivo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "meeting_templates")
public class MeetingTemplate {

    @Id
    private String id;

    private String name;
    private String description;
    private String userId; // Owner if personal template
    private String organizationId; // Owner if organization template
    
    @Builder.Default
    private boolean isOrganizationTemplate = false;

    // Reusable meeting settings
    @Builder.Default
    private boolean waitingRoomEnabled = false;

    @Builder.Default
    private boolean recordingEnabled = false;

    @Builder.Default
    private boolean chatEnabled = true;

    @Builder.Default
    private boolean screenShareEnabled = true;

    @Builder.Default
    private SharePermission sharePermission = SharePermission.ALL_PARTICIPANTS;

    @Builder.Default
    private boolean passwordProtected = false;

    @Builder.Default
    private int maxParticipants = 100;

    @Builder.Default
    private MeetingScope meetingScope = MeetingScope.PUBLIC;

    private LocalDateTime createdAt;
}
