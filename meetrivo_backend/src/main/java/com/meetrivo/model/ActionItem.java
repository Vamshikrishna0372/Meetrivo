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
@Document(collection = "action_items")
public class ActionItem {

    @Id
    private String id;

    @Indexed
    private String meetingId;

    private String task;
    private String assignedTo;
    private String assignedToName;
    private LocalDateTime dueDate;

    @Builder.Default
    private ActionItemPriority priority = ActionItemPriority.MEDIUM;

    @Builder.Default
    private ActionItemStatus status = ActionItemStatus.OPEN;

    private String createdByUserId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
