package com.meetrivo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "meeting_invitations")
public class MeetingInvitation {

    @Id
    private String id;

    @Indexed
    private String meetingId;

    private String senderId;

    @Indexed
    private String receiverEmail;

    @Indexed
    private String receiverUserId; // optional if receiver is not registered yet

    @Builder.Default
    private InvitationStatus status = InvitationStatus.PENDING;

    private LocalDateTime sentAt;
    private LocalDateTime respondedAt;
}
