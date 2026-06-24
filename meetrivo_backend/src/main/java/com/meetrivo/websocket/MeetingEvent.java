package com.meetrivo.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingEvent {
    private MeetingEventType eventType;
    private String meetingId;
    private String userId;
    private String username;
    
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    
    private Object payload;
}
