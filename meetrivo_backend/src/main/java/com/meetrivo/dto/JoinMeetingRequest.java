package com.meetrivo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JoinMeetingRequest {
    @NotBlank(message = "Meeting ID or code is required")
    private String meetingIdentifier; // can be meetingId or meetingCode
    private String password;          // optional, required for password-protected meetings
}
