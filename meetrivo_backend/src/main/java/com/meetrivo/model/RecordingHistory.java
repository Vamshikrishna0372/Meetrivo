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
@Document(collection = "recording_history")
public class RecordingHistory {

    @Id
    private String id;

    @Indexed
    private String meetingId;

    @Indexed
    private String recordingId;

    private String action;          // STARTED, PAUSED, RESUMED, STOPPED, DELETED
    private String performedById;
    private String performedByName;

    private LocalDateTime timestamp;

    private String notes;           // optional context (e.g. "Host ended session")
}
