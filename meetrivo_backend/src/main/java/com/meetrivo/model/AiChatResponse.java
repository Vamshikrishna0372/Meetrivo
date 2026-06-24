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
@Document(collection = "ai_chat_responses")
public class AiChatResponse {

    @Id
    private String id;

    @Indexed
    private String meetingId;

    private String requestedByUserId;
    private String requestedByUsername;

    private String userQuery;
    private String aiResponse;
    private String context;     // what context was fed to Groq

    private String modelUsed;
    private long responseTimeMs;

    private LocalDateTime createdAt;
}
