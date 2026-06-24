package com.meetrivo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendInvitationRequest {

    @NotBlank(message = "Meeting ID is required")
    private String meetingId;

    @NotBlank(message = "Receiver email is required")
    @Email(message = "Receiver email must be valid")
    private String receiverEmail;
}
