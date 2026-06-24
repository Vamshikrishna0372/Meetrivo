package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.model.*;
import com.meetrivo.repository.MeetingParticipantRepository;
import com.meetrivo.repository.MeetingRepository;
import com.meetrivo.service.JoinService;
import com.meetrivo.service.MeetingPresenceService;
import com.meetrivo.webrtc.WebRTCService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MeetingMediaControllerTest {

    @Mock
    private WebRTCService webrtcService;

    @Mock
    private MeetingRepository meetingRepository;

    @Mock
    private MeetingParticipantRepository meetingParticipantRepository;

    @Mock
    private JoinService joinService;

    @Mock
    private MeetingPresenceService presenceService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private com.meetrivo.util.LoggerUtil logger;

    @InjectMocks
    private MeetingMediaController meetingMediaController;

    private User testHost;
    private Meeting testMeeting;
    private SecurityContext securityContext;
    private Authentication authentication;

    @BeforeEach
    public void setup() {
        testHost = User.builder()
                .id("host-123")
                .username("hostuser")
                .fullName("Host User")
                .email("host@meetrivo.com")
                .build();

        testMeeting = Meeting.builder()
                .meetingId("meeting-123")
                .hostId("host-123")
                .status(MeetingStatus.ACTIVE)
                .build();

        authentication = mock(Authentication.class);
        securityContext = mock(SecurityContext.class);
    }

    @Test
    public void testRemoveParticipant_Success() {
        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testHost);

            when(meetingRepository.findByMeetingId("meeting-123")).thenReturn(Optional.of(testMeeting));

            ApiResponse<String> response = meetingMediaController.removeParticipant("meeting-123", "participant-456");

            assertNotNull(response);
            assertTrue(response.isSuccess());
            assertEquals("Participant removed successfully", response.getData());

            verify(joinService).removeParticipant("meeting-123", "participant-456");
            verify(presenceService).handleUserLeft("meeting-123", "participant-456");
            verify(webrtcService).endSession("meeting-123", "participant-456");
            verify(messagingTemplate).convertAndSend(eq("/topic/meeting/meeting-123"), ArgumentMatchers.<Object>any());
        }
    }

    @Test
    public void testLowerHand_Success() {
        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testHost);

            when(meetingRepository.findByMeetingId("meeting-123")).thenReturn(Optional.of(testMeeting));

            ApiResponse<String> response = meetingMediaController.lowerHand("meeting-123", "participant-456");

            assertNotNull(response);
            assertTrue(response.isSuccess());
            assertEquals("Hand lowered successfully", response.getData());

            verify(webrtcService).updateHandRaised("meeting-123", "participant-456", false);
            verify(messagingTemplate).convertAndSend(eq("/topic/chat/meeting-123"), ArgumentMatchers.<Object>any());
        }
    }
}
