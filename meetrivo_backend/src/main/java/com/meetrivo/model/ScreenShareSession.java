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
@Document(collection = "screen_share_sessions")
public class ScreenShareSession {

    @Id
    private String id;

    private String meetingId;
    private String userId;
    private String sessionId;
    private ShareType shareType;
    private ShareStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
}
