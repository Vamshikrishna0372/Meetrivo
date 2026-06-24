package com.meetrivo.websocket;

import com.meetrivo.dto.SendMessageRequest;
import com.meetrivo.model.ReactionType;
import com.meetrivo.model.User;
import com.meetrivo.service.ChatService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

import org.springframework.security.core.context.SecurityContextHolder;
import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;

    /**
     * Client sends: /app/chat/{meetingId}/message
     * Broadcasts to /topic/chat/{meetingId} for public or /topic/private/{userId} for private.
     */
    @MessageMapping("/chat/{meetingId}/message")
    public void sendMessage(
            @DestinationVariable String meetingId,
            @Payload WsMessageRequest request,
            Principal principal) {
        if (principal == null) return;
        User user = resolve(principal);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                user, null, user.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
        try {
            SendMessageRequest dto = SendMessageRequest.builder()
                    .meetingId(meetingId)
                    .message(request.getMessage())
                    .receiverId(request.getReceiverId())
                    .build();

            chatService.sendMessage(dto);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    /**
     * Client sends: /app/chat/{meetingId}/reaction
     * Payload: { "type": "CLAP" }
     */
    @MessageMapping("/chat/{meetingId}/reaction")
    public void sendReaction(
            @DestinationVariable String meetingId,
            @Payload ReactionRequest request,
            Principal principal) {
        if (principal == null) return;
        User user = resolve(principal);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                user, null, user.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
        try {
            ReactionType type = ReactionType.valueOf(request.getType());
            chatService.sendReaction(meetingId, type);
        } catch (IllegalArgumentException ignored) {
            // Invalid reaction type — discard silently
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    /**
     * Client sends: /app/chat/{meetingId}/hand
     * Payload: { "raised": true }
     */
    @MessageMapping("/chat/{meetingId}/hand")
    public void raiseHand(
            @DestinationVariable String meetingId,
            @Payload HandRequest request,
            Principal principal) {
        if (principal == null) return;
        User user = resolve(principal);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                user, null, user.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
        try {
            chatService.raiseHand(meetingId, request.isRaised());
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    private User resolve(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken token) {
            return (User) token.getPrincipal();
        }
        throw new RuntimeException("Invalid principal type");
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class WsMessageRequest {
        private String message;
        private String receiverId;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ReactionRequest {
        private String type;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class HandRequest {
        private boolean raised;
    }
}
