package com.meetrivo.dto;

import com.meetrivo.model.ShareType;
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
public class StartShareRequest {

    @NotBlank(message = "Meeting ID is required")
    private String meetingId;

    @NotBlank(message = "Session ID is required")
    private String sessionId;

    @NotNull(message = "Share Type is required")
    private ShareType shareType;
}
