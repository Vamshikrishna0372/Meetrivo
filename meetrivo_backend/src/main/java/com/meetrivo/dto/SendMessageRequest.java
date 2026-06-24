package com.meetrivo.dto;

import com.meetrivo.model.MessageType;
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
public class SendMessageRequest {

    @NotNull(message = "Meeting ID is required")
    private String meetingId;

    @NotBlank(message = "Message cannot be empty")
    private String message;

    @Builder.Default
    private MessageType messageType = MessageType.TEXT;

    // null = public, non-null = private
    private String receiverId;
}
