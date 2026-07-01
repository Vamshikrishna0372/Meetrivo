package com.meetrivo.websocket;

import com.meetrivo.model.User;
import com.meetrivo.repository.MeetingParticipantRepository;
import com.meetrivo.repository.MeetingRepository;
import com.meetrivo.repository.UserRepository;
import com.meetrivo.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.security.Principal;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository meetingParticipantRepository;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor != null) {
                    if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                        String authHeader = accessor.getFirstNativeHeader("Authorization");
                        if (authHeader != null && authHeader.startsWith("Bearer ")) {
                            String token = authHeader.substring(7);
                            try {
                                String username = jwtService.extractUsername(token);
                                if (username != null) {
                                    User user = userRepository.findByUsername(username)
                                            .or(() -> userRepository.findByEmail(username))
                                            .orElse(null);
                                    if (user != null && jwtService.isTokenValid(token, user)) {
                                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                                user, null, user.getAuthorities()
                                        );
                                        accessor.setUser(auth);
                                    } else {
                                        throw new MessageDeliveryException("Unauthorized: Invalid JWT token");
                                    }
                                } else {
                                    throw new MessageDeliveryException("Unauthorized: Missing username claim");
                                }
                            } catch (Exception e) {
                                throw new MessageDeliveryException("Unauthorized: JWT token validation failed");
                            }
                        } else {
                            throw new MessageDeliveryException("Unauthorized: Missing or malformed Authorization header");
                        }
                    } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                        String destination = accessor.getDestination();
                        Principal principal = accessor.getUser();
                        if (principal == null) {
                            throw new MessageDeliveryException("Unauthorized subscription: user not authenticated");
                        }

                        User user = null;
                        if (principal instanceof UsernamePasswordAuthenticationToken) {
                            user = (User) ((UsernamePasswordAuthenticationToken) principal).getPrincipal();
                        }

                        if (user == null) {
                            throw new MessageDeliveryException("Unauthorized subscription: user principal not resolved");
                        }

                        if (destination != null && destination.startsWith("/topic/private/")) {
                            String[] parts = destination.split("/");
                            if (parts.length >= 4) {
                                String targetUserId = parts[3];
                                if (!user.getId().equals(targetUserId)) {
                                    throw new MessageDeliveryException("Forbidden: User is not authorized to subscribe to this private queue");
                                }
                            }
                        }

                        String meetingId = extractMeetingIdFromDestination(destination);
                        if (meetingId != null) {
                            final String userId = user.getId();
                            boolean isHost = meetingRepository.findByMeetingId(meetingId)
                                    .map(m -> m.getHostId().equals(userId))
                                    .orElse(false);
                            boolean isParticipant = meetingParticipantRepository.existsByMeetingIdAndUserId(meetingId, userId);

                            if (!isHost && !isParticipant) {
                                throw new MessageDeliveryException("Forbidden: User is not a member of the meeting: " + meetingId);
                            }
                        }
                    }
                }
                return message;
            }
        });
    }

    private String extractMeetingIdFromDestination(String destination) {
        if (destination == null) return null;
        if (destination.startsWith("/topic/meeting/") ||
                destination.startsWith("/topic/participants/") ||
                destination.startsWith("/topic/signaling/") ||
                destination.startsWith("/topic/chat/") ||
                destination.startsWith("/topic/screenshare/") ||
                destination.startsWith("/topic/presenter/") ||
                destination.startsWith("/topic/whiteboard/") ||
                destination.startsWith("/topic/recording/")) {
            String[] parts = destination.split("/");
            if (parts.length >= 4) {
                return parts[3];
            }
        }
        return null;
    }
}
