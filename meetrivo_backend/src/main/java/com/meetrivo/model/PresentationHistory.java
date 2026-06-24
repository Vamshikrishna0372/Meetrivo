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
@Document(collection = "presentation_history")
public class PresentationHistory {

    @Id
    private String id;

    private String meetingId;
    private String presenterId;
    private String presenterName;
    private boolean active;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
