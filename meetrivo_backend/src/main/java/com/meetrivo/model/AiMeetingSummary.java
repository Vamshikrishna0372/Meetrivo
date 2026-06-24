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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "ai_meeting_summaries")
public class AiMeetingSummary {

    @Id
    private String id;

    @Indexed
    private String meetingId;

    private String meetingTitle;

    private String hostId;

    // AI-generated fields
    private String summary;
    private List<String> keyPoints;
    private List<String> actionItems;
    private List<String> decisions;
    private String sentiment;          // POSITIVE / NEUTRAL / NEGATIVE
    private int estimatedDurationMinutes;
    private int participantCount;
    private int messageCount;

    // Groq model used
    private String modelUsed;

    private LocalDateTime generatedAt;
    private LocalDateTime meetingEndedAt;
}
