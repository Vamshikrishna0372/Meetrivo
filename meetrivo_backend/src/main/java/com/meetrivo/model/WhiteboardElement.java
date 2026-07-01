package com.meetrivo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "whiteboard_elements")
public class WhiteboardElement {

    @Id
    private String id;

    @Indexed
    private String sessionId;

    @Indexed
    private String meetingId;

    private WhiteboardElementType elementType;

    // Position & size
    private double x;
    private double y;
    private double width;
    private double height;

    // Style
    private String color;
    private double strokeWidth;
    private double opacity;

    // Content (for TEXT, STICKY_NOTE)
    private String content;
    private String fontFamily;
    private double fontSize;

    // Path data (for PEN, MARKER, LINE, ARROW — list of {x,y} points)
    private List<Map<String, Double>> points;

    // Direct mapping to frontend Stroke fields
    private String tool;
    private double size;

    // Rotation in degrees
    private double rotation;

    private String createdBy;
    private String createdByName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder.Default
    private boolean deleted = false;
}
