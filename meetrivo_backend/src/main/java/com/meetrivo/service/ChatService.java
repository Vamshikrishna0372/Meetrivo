package com.meetrivo.service;

import com.meetrivo.dto.ChatMessageResponse;
import com.meetrivo.dto.SendMessageRequest;
import com.meetrivo.model.ChatMessage;
import com.meetrivo.model.MessageType;
import com.meetrivo.model.ReactionType;
import com.meetrivo.model.User;
import com.meetrivo.repository.ChatMessageRepository;
import com.meetrivo.repository.MeetingParticipantRepository;
import com.meetrivo.repository.MeetingRepository;
import com.meetrivo.repository.ReactionRepository;
import com.meetrivo.model.AnalyticsEventType;
import com.meetrivo.model.Reaction;
import com.meetrivo.model.RaiseHandEvent;
import com.meetrivo.webrtc.ParticipantMediaStateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService extends BaseService {

    private final ChatMessageRepository chatMessageRepository;
    private final ReactionRepository reactionRepository;
    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository participantRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ParticipantMediaStateRepository mediaStateRepository;
    private final AnalyticsService analyticsService;

    // ─── Send Message ────────────────────────────────────────────────────────

    public ChatMessageResponse sendMessage(SendMessageRequest request) {
        User sender = getCurrentUser();
        validateMembership(request.getMeetingId(), sender.getId());

        ChatMessage message = ChatMessage.builder()
                .meetingId(request.getMeetingId())
                .senderId(sender.getId())
                .senderName(sender.getFullName() != null ? sender.getFullName() : sender.getUsername())
                .receiverId(request.getReceiverId())
                .message(request.getMessage())
                .messageType(request.getReceiverId() != null ? MessageType.PRIVATE_MESSAGE : request.getMessageType())
                .timestamp(LocalDateTime.now())
                .build();

        ChatMessage saved = chatMessageRepository.save(message);
        analyticsService.trackEvent(AnalyticsEventType.CHAT_SENT, sender.getId(), request.getMeetingId(), null);
        ChatMessageResponse response = mapToResponse(saved);

        // Real-time broadcast
        if (saved.getReceiverId() != null) {
            // Private — deliver to recipient's personal queue
            messagingTemplate.convertAndSend("/topic/private/" + saved.getReceiverId(), response);
            messagingTemplate.convertAndSend("/topic/private/" + saved.getSenderId(), response);
        } else {
            // Public — broadcast to meeting chat topic
            messagingTemplate.convertAndSend("/topic/chat/" + saved.getMeetingId(), response);
        }

        logInfo("Message sent by " + sender.getUsername() + " in meeting: " + request.getMeetingId());
        return response;
    }

    // ─── Get History ─────────────────────────────────────────────────────────

    public List<ChatMessageResponse> getMeetingMessages(String meetingId) {
        String currentUserId = getCurrentUser().getId();
        validateMembership(meetingId, currentUserId);
        return chatMessageRepository
                .findByMeetingIdAndDeletedFalseOrderByTimestampAsc(meetingId)
                .stream()
                .filter(msg -> msg.getReceiverId() == null || 
                               msg.getSenderId().equals(currentUserId) || 
                               msg.getReceiverId().equals(currentUserId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─── Edit Message ─────────────────────────────────────────────────────────

    public ChatMessageResponse editMessage(String messageId, String newText) {
        User user = getCurrentUser();
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found: " + messageId));

        if (!message.getSenderId().equals(user.getId())) {
            throw new RuntimeException("You can only edit your own messages");
        }

        message.setMessage(newText);
        message.setEdited(true);
        ChatMessage saved = chatMessageRepository.save(message);
        ChatMessageResponse response = mapToResponse(saved);

        // Broadcast edit
        if (saved.getReceiverId() != null) {
            messagingTemplate.convertAndSend("/topic/private/" + saved.getReceiverId(), response);
        } else {
            messagingTemplate.convertAndSend("/topic/chat/" + saved.getMeetingId(), response);
        }
        return response;
    }

    // ─── Delete Message ───────────────────────────────────────────────────────

    public void deleteMessage(String messageId) {
        User user = getCurrentUser();
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found: " + messageId));

        // Only sender or host can delete
        boolean isHost = meetingRepository.findByMeetingId(message.getMeetingId())
                .map(m -> m.getHostId().equals(user.getId()))
                .orElse(false);

        if (!message.getSenderId().equals(user.getId()) && !isHost) {
            throw new RuntimeException("You are not authorised to delete this message");
        }

        message.setDeleted(true);
        message.setMessage("[Message deleted]");
        ChatMessage saved = chatMessageRepository.save(message);
        ChatMessageResponse response = mapToResponse(saved);

        messagingTemplate.convertAndSend("/topic/chat/" + saved.getMeetingId(), response);
        logInfo("Message deleted: " + messageId);
    }

    // ─── Reactions ────────────────────────────────────────────────────────────

    public void sendReaction(String meetingId, ReactionType reactionType) {
        User user = getCurrentUser();
        validateMembership(meetingId, user.getId());

        Reaction reaction = Reaction.builder()
                .meetingId(meetingId)
                .userId(user.getId())
                .username(user.getFullName() != null ? user.getFullName() : user.getUsername())
                .reactionType(reactionType)
                .timestamp(LocalDateTime.now())
                .build();

        reactionRepository.save(reaction);

        // Broadcast to meeting topics
        var event = java.util.Map.of(
                "eventType", "REACTION_SENT",
                "meetingId", meetingId,
                "userId", user.getId(),
                "username", reaction.getUsername(),
                "reactionType", reactionType.name(),
                "timestamp", reaction.getTimestamp().toString()
        );
        messagingTemplate.convertAndSend("/topic/chat/" + meetingId, event);
        messagingTemplate.convertAndSend("/topic/meeting/" + meetingId, event);
        logInfo("Reaction " + reactionType + " sent by " + user.getUsername() + " in meeting: " + meetingId);
    }

    // ─── Raise Hand ───────────────────────────────────────────────────────────

    public void raiseHand(String meetingId, boolean raised) {
        User user = getCurrentUser();
        validateMembership(meetingId, user.getId());

        // Update ParticipantMediaState in database
        mediaStateRepository.findByMeetingIdAndUserId(meetingId, user.getId()).ifPresent(state -> {
            state.setHandRaised(raised);
            mediaStateRepository.save(state);
        });

        LocalDateTime raisedAt = LocalDateTime.now();

        var event = java.util.Map.of(
                "eventType", raised ? "HAND_RAISED" : "HAND_LOWERED",
                "userId", user.getId(),
                "username", user.getUsername() != null ? user.getUsername() : "",
                "meetingId", meetingId,
                "raisedAt", raisedAt.toString(),
                "timestamp", raisedAt.toString()
        );

        messagingTemplate.convertAndSend("/topic/chat/" + meetingId, event);
        messagingTemplate.convertAndSend("/topic/meeting/" + meetingId, event);
        logInfo("Hand " + (raised ? "raised" : "lowered") + " by " + user.getUsername() + " in meeting: " + meetingId);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private void validateMembership(String meetingId, String userId) {
        boolean isHost = meetingRepository.findByMeetingId(meetingId)
                .map(m -> m.getHostId().equals(userId))
                .orElse(false);
        boolean isParticipant = participantRepository.existsByMeetingIdAndUserId(meetingId, userId);
        if (!isHost && !isParticipant) {
            throw new RuntimeException("You are not a member of this meeting");
        }
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private ChatMessageResponse mapToResponse(ChatMessage msg) {
        return ChatMessageResponse.builder()
                .id(msg.getId())
                .meetingId(msg.getMeetingId())
                .senderId(msg.getSenderId())
                .senderName(msg.getSenderName())
                .receiverId(msg.getReceiverId())
                .message(msg.getMessage())
                .messageType(msg.getMessageType())
                .timestamp(msg.getTimestamp())
                .edited(msg.isEdited())
                .deleted(msg.isDeleted())
                .build();
    }
}
