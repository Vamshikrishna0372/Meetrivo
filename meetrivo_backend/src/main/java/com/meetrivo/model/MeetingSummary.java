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
@Document(collection = "meeting_summaries")
public class MeetingSummary {

    @Id
    private String id;

    @Indexed(unique = true)
    private String meetingId;

    private String meetingTitle;

    private String summary;
    private List<String> keyPoints;
    private List<String> actionItems;
    private List<String> keyDecisions;
    private List<String> highlights;

    // Speaker analytics
    private List<SpeakerStat> speakerStats;

    private String sentiment;         // POSITIVE / NEUTRAL / NEGATIVE
    private int totalMessages;
    private int totalParticipants;
    private int durationMinutes;

    private String modelUsed;
    private LocalDateTime generatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SpeakerStat {
        private String speakerId;
        private String speakerName;
        private int messageCount;
        private int transcriptLines;
    }
}
