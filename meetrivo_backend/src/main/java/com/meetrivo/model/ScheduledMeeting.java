package com.meetrivo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "scheduled_meetings")
public class ScheduledMeeting {

    @Id
    private String id;

    @Indexed
    private String meetingId;

    @Indexed
    private String hostId;

    private String title;
    private String description;
    
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String timezone;
    
    private boolean recurring;
    private String recurrenceRule; // e.g. DAILY, WEEKLY, MONTHLY, or Custom iCal RRULE

    @Builder.Default
    private ScheduledMeetingStatus status = ScheduledMeetingStatus.UPCOMING;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
