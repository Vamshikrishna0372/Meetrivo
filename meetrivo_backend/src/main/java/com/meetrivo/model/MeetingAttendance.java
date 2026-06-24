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
@Document(collection = "meeting_attendances")
public class MeetingAttendance {

    @Id
    private String id;

    private String meetingId;
    private String userId;
    private String username;
    private String displayName;
    
    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;
    private Long durationSeconds;
    private boolean present;
}
