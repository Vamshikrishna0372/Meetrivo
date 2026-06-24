package com.meetrivo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "meeting_recordings")
public class MeetingRecording {

    @Id
    private String id;

    @Indexed
    private String meetingId;

    @Indexed(unique = true)
    private String recordingId;   // UUID-based unique identifier

    private String hostId;        // User who started the recording

    private String fileName;
    private Long fileSize;        // bytes
    private Long duration;        // seconds

    private String storagePath;   // local path or cloud URI

    @Builder.Default
    private RecordingType recordingType = RecordingType.FULL_MEETING;

    @Builder.Default
    private RecordingStatus status = RecordingStatus.STARTING;

    @Builder.Default
    private RecordingPermission permission = RecordingPermission.HOST_ONLY;

    private String shareToken;    // for public/shared link access

    @CreatedDate
    private LocalDateTime createdAt;

    private LocalDateTime startedAt;
    private LocalDateTime pausedAt;
    private LocalDateTime resumedAt;
    private LocalDateTime completedAt;
}
