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
@Document(collection = "support_tickets")
public class SupportTicket {

    @Id
    private String id;

    private String ticketId; // e.g. TKT-983472
    private String userId;
    private String username;
    
    private String category;
    private String priority;
    private String status; // OPEN, IN_PROGRESS, RESOLVED, CLOSED
    
    private String subject;
    private String description;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
