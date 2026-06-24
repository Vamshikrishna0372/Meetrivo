package com.meetrivo.dto;

import com.meetrivo.model.RecordingPermission;
import com.meetrivo.model.RecordingType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartRecordingRequest {

    @NotBlank(message = "Meeting ID is required")
    private String meetingId;

    @NotNull(message = "Recording type is required")
    @Builder.Default
    private RecordingType recordingType = RecordingType.FULL_MEETING;

    @Builder.Default
    private RecordingPermission permission = RecordingPermission.HOST_ONLY;
}
