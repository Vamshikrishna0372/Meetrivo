package com.meetrivo.webrtc;

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
@Document(collection = "screenshare_states")
public class ScreenShareState {
    @Id
    private String id;
    
    private String meetingId;
    private String userId;
    private boolean active;
    private LocalDateTime startedAt;
}
