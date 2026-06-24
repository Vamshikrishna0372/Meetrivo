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
@Document(collection = "sticky_notes")
public class StickyNote {

    @Id
    private String id;

    @Indexed
    private String meetingId;

    private String userId;
    private String username;

    private String content;

    // Position on shared canvas
    private double x;
    private double y;

    // Visual color (hex or tailwind-style class)
    @Builder.Default
    private String color = "#FFF176";

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
