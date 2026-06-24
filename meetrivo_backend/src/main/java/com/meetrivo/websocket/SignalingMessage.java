package com.meetrivo.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignalingMessage {
    private MeetingSignalType type;
    private String meetingId;
    private String senderId;
    private String receiverId;
    private Object payload;
}
