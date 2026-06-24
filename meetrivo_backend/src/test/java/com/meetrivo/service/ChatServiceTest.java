package com.meetrivo.service;

import com.meetrivo.dto.ChatMessageResponse;
import com.meetrivo.dto.SendMessageRequest;
import com.meetrivo.model.*;
import com.meetrivo.repository.ChatMessageRepository;
import com.meetrivo.repository.MeetingParticipantRepository;
import com.meetrivo.repository.MeetingRepository;
import com.meetrivo.repository.ReactionRepository;
import com.meetrivo.webrtc.ParticipantMediaState;
import com.meetrivo.webrtc.ParticipantMediaStateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ChatServiceTest {

    @Mock
    private ChatMessageRepository chatMessageRepository;
    @Mock
    private ReactionRepository reactionRepository;
    @Mock
    private MeetingRepository meetingRepository;
    @Mock
    private MeetingParticipantRepository participantRepository;
    @Mock
    private SimpMessagingTemplate messagingTemplate;
    @Mock
    private ParticipantMediaStateRepository mediaStateRepository;
    @Mock
    private com.meetrivo.util.LoggerUtil logger;
    @Mock
    private AnalyticsService analyticsService;

    @InjectMocks
    private ChatService chatService;

    private User testUser;
    private SecurityContext securityContext;
    private Authentication authentication;

    @BeforeEach
    public void setup() {
        chatService.logger = logger;

        testUser = User.builder()
                .id("user-123")
                .username("testuser")
                .fullName("Test User")
                .email("testuser@meetrivo.com")
                .build();

        authentication = mock(Authentication.class);
        securityContext = mock(SecurityContext.class);
    }

    @Test
    public void testSendMessage_Public() {
        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testUser);

            when(meetingRepository.findByMeetingId("meeting-123")).thenReturn(Optional.of(Meeting.builder().hostId("user-123").build()));

            SendMessageRequest request = SendMessageRequest.builder()
                    .meetingId("meeting-123")
                    .message("Hello public")
                    .messageType(MessageType.TEXT)
                    .build();

            ChatMessage savedMessage = ChatMessage.builder()
                    .id("msg-1")
                    .meetingId("meeting-123")
                    .senderId("user-123")
                    .senderName("Test User")
                    .message("Hello public")
                    .messageType(MessageType.TEXT)
                    .timestamp(LocalDateTime.now())
                    .build();

            when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(savedMessage);

            ChatMessageResponse response = chatService.sendMessage(request);

            assertNotNull(response);
            assertEquals("Hello public", response.getMessage());
            assertNull(response.getReceiverId());
            verify(messagingTemplate).convertAndSend(eq("/topic/chat/meeting-123"), any(ChatMessageResponse.class));
        }
    }

    @Test
    public void testSendMessage_Private() {
        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testUser);

            when(meetingRepository.findByMeetingId("meeting-123")).thenReturn(Optional.of(Meeting.builder().hostId("user-123").build()));

            SendMessageRequest request = SendMessageRequest.builder()
                    .meetingId("meeting-123")
                    .message("Hello private")
                    .receiverId("user-456")
                    .build();

            ChatMessage savedMessage = ChatMessage.builder()
                    .id("msg-2")
                    .meetingId("meeting-123")
                    .senderId("user-123")
                    .senderName("Test User")
                    .receiverId("user-456")
                    .message("Hello private")
                    .messageType(MessageType.PRIVATE_MESSAGE)
                    .timestamp(LocalDateTime.now())
                    .build();

            when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(savedMessage);

            ChatMessageResponse response = chatService.sendMessage(request);

            assertNotNull(response);
            assertEquals("Hello private", response.getMessage());
            assertEquals("user-456", response.getReceiverId());
            verify(messagingTemplate).convertAndSend(eq("/topic/private/user-456"), any(ChatMessageResponse.class));
            verify(messagingTemplate).convertAndSend(eq("/topic/private/user-123"), any(ChatMessageResponse.class));
        }
    }

    @Test
    public void testGetMeetingMessages_FiltersPrivate() {
        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testUser);

            when(meetingRepository.findByMeetingId("meeting-123")).thenReturn(Optional.of(Meeting.builder().hostId("user-123").build()));

            ChatMessage publicMsg = ChatMessage.builder()
                    .id("m1")
                    .meetingId("meeting-123")
                    .message("Public Message")
                    .build();

            ChatMessage privateToMe = ChatMessage.builder()
                    .id("m2")
                    .meetingId("meeting-123")
                    .receiverId("user-123")
                    .senderId("user-456")
                    .message("Private to Me")
                    .build();

            ChatMessage privateFromMe = ChatMessage.builder()
                    .id("m3")
                    .meetingId("meeting-123")
                    .receiverId("user-789")
                    .senderId("user-123")
                    .message("Private from Me")
                    .build();

            ChatMessage privateOther = ChatMessage.builder()
                    .id("m4")
                    .meetingId("meeting-123")
                    .receiverId("user-789")
                    .senderId("user-456")
                    .message("Private between others")
                    .build();

            when(chatMessageRepository.findByMeetingIdAndDeletedFalseOrderByTimestampAsc("meeting-123"))
                    .thenReturn(Arrays.asList(publicMsg, privateToMe, privateFromMe, privateOther));

            List<ChatMessageResponse> messages = chatService.getMeetingMessages("meeting-123");

            assertEquals(3, messages.size());
            assertEquals("Public Message", messages.get(0).getMessage());
            assertEquals("Private to Me", messages.get(1).getMessage());
            assertEquals("Private from Me", messages.get(2).getMessage());
        }
    }

    @Test
    public void testSendReaction() {
        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testUser);

            when(meetingRepository.findByMeetingId("meeting-123")).thenReturn(Optional.of(Meeting.builder().hostId("user-123").build()));

            chatService.sendReaction("meeting-123", ReactionType.HEART);

            verify(reactionRepository).save(any(Reaction.class));
            verify(messagingTemplate).convertAndSend(eq("/topic/chat/meeting-123"), ArgumentMatchers.<Object>any());
            verify(messagingTemplate).convertAndSend(eq("/topic/meeting/meeting-123"), ArgumentMatchers.<Object>any());
        }
    }

    @Test
    public void testRaiseHand() {
        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testUser);

            when(meetingRepository.findByMeetingId("meeting-123")).thenReturn(Optional.of(Meeting.builder().hostId("user-123").build()));

            ParticipantMediaState mediaState = ParticipantMediaState.builder()
                    .meetingId("meeting-123")
                    .userId("user-123")
                    .handRaised(false)
                    .build();

            when(mediaStateRepository.findByMeetingIdAndUserId("meeting-123", "user-123"))
                    .thenReturn(Optional.of(mediaState));

            chatService.raiseHand("meeting-123", true);

            assertTrue(mediaState.isHandRaised());
            verify(mediaStateRepository).save(mediaState);
            verify(messagingTemplate).convertAndSend(eq("/topic/chat/meeting-123"), ArgumentMatchers.<Object>any());
            verify(messagingTemplate).convertAndSend(eq("/topic/meeting/meeting-123"), ArgumentMatchers.<Object>any());
        }
    }
}
