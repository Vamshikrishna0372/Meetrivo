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
@Document(collection = "system_alerts")
public class SystemAlert {

    @Id
    private String id;

    private String alertType; // e.g. HIGH_CPU, HIGH_MEMORY, DATABASE_DOWN, SERVICE_FAILURE
    private String message;
    private String severity;  // e.g. WARNING, CRITICAL
    private LocalDateTime timestamp;
    private boolean resolved;
    private LocalDateTime resolvedAt;
}
