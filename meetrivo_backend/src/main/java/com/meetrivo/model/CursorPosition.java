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
@Document(collection = "cursor_positions")
public class CursorPosition {

    @Id
    private String id;

    @Indexed
    private String meetingId;

    private String userId;
    private String username;

    private double x;
    private double y;

    // Optional: tool being used (for cursor icon hint on remote side)
    private String activeTool;

    private LocalDateTime updatedAt;
}
