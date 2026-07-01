package com.meetrivo.websocket;

import com.meetrivo.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class WhiteboardWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Client sends to:
     * /app/whiteboard/{meetingId}/event
     *
     * Server broadcasts to:
     * /topic/whiteboard/{meetingId}
     */
    @MessageMapping("/whiteboard/{meetingId}/event")
    public void handleWhiteboardEvent(
            @DestinationVariable String meetingId,
            @Payload Map<String, Object> event,
            Principal principal) {

        if (principal == null) {
            return;
        }

        User user = resolveUser(principal);

        // Add sender information
        event.put("senderId", user.getId());
        event.put(
                "senderName",
                user.getFullName() != null
                        ? user.getFullName()
                        : user.getUsername()
        );

        // Broadcast the event to all participants in the meeting
        messagingTemplate.convertAndSend(
                "/topic/whiteboard/" + meetingId,
                (Object) event
        );
    }

    /**
     * Resolve authenticated user from Spring Security Principal.
     */
    private User resolveUser(Principal principal) {

        if (principal instanceof UsernamePasswordAuthenticationToken token) {

            Object authenticatedUser = token.getPrincipal();

            if (authenticatedUser instanceof User user) {
                return user;
            }
        }

        throw new IllegalStateException("Unable to resolve authenticated user.");
    }
}