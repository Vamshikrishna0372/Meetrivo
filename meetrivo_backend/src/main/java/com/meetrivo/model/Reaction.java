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
@Document(collection = "reactions")
public class Reaction {

    @Id
    private String id;

    private String meetingId;
    private String userId;
    private String username;
    private ReactionType reactionType;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
