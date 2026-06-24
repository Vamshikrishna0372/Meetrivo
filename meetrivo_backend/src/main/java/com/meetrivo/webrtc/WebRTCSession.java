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
@Document(collection = "webrtc_sessions")
public class WebRTCSession {
    @Id
    private String id;
    
    private String sessionId;
    private String meetingId;
    private String userId;
    private String connectionId;
    private ConnectionStatus connectionState;
    private LocalDateTime createdAt;
    private LocalDateTime lastActivityAt;
}
