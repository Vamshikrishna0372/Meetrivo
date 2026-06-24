package com.meetrivo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "analytics_events")
public class AnalyticsEvent {

    @Id
    private String id;

    private AnalyticsEventType eventType;
    private String userId;
    private String meetingId;
    private LocalDateTime timestamp;
    private Map<String, String> metadata;
}
