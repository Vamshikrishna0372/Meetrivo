package com.meetrivo.webrtc;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantMediaEvent {
    private String eventType;
    private String meetingId;
    private String userId;
    
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    
    private Object payload;
}
