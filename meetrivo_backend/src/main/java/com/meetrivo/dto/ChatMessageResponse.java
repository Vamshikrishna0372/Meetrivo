package com.meetrivo.dto;

import com.meetrivo.model.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private String id;
    private String meetingId;
    private String senderId;
    private String senderName;
    private String receiverId;
    private String message;
    private MessageType messageType;
    private LocalDateTime timestamp;
    private boolean edited;
    private boolean deleted;
}
