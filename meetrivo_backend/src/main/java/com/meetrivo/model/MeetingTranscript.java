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
@Document(collection = "meeting_transcripts")
public class MeetingTranscript {

    @Id
    private String id;

    @Indexed
    private String meetingId;

    private String speakerId;
    private String speakerName;

    private String text;
    private String language;

    @Indexed
    private LocalDateTime timestamp;
}
