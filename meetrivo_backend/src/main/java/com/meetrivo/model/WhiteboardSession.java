package com.meetrivo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "whiteboard_sessions")
public class WhiteboardSession {

    @Id
    private String id;

    @Indexed(unique = true)
    private String meetingId;

    private String ownerId;

    @Builder.Default
    private WhiteboardStatus status = WhiteboardStatus.ACTIVE;

    private LocalDateTime createdAt;
    private LocalDateTime closedAt;
}
