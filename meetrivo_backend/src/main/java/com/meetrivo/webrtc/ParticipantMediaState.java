package com.meetrivo.webrtc;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "participant_media_states")
public class ParticipantMediaState {
    @Id
    private String id;
    
    private String userId;
    private String meetingId;
    private boolean videoEnabled;
    private boolean audioEnabled;
    private boolean screenSharing;
    private boolean handRaised;
    private boolean speakerActive;
}
