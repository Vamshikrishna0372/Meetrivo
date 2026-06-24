package com.meetrivo.service;

import com.meetrivo.model.*;
import com.meetrivo.repository.MeetingParticipantRepository;
import com.meetrivo.repository.MeetingRepository;
import com.meetrivo.repository.PresentationHistoryRepository;
import com.meetrivo.repository.ScreenShareSessionRepository;
import com.meetrivo.webrtc.WebRTCService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ScreenShareServiceTest {

    @Mock
    private ScreenShareSessionRepository sessionRepository;
    @Mock
    private PresentationHistoryRepository historyRepository;
    @Mock
    private MeetingRepository meetingRepository;
    @Mock
    private MeetingParticipantRepository participantRepository;
    @Mock
    private SimpMessagingTemplate messagingTemplate;
    @Mock
    private WebRTCService webrtcService;
    @Mock
    private com.meetrivo.util.LoggerUtil logger;

    @InjectMocks
    private ScreenShareService screenShareService;

    private User testUser;
    private Meeting testMeeting;
    private SecurityContext securityContext;
    private Authentication authentication;

    @BeforeEach
    public void setup() {
        screenShareService.logger = logger;

        testUser = User.builder()
                .id("user-123")
                .username("testuser")
                .fullName("Test User")
                .build();

        testMeeting = Meeting.builder()
                .meetingId("meeting-123")
                .hostId("user-123")
                .screenShareEnabled(true)
                .sharePermission(SharePermission.ALL_PARTICIPANTS)
                .status(MeetingStatus.ACTIVE)
                .build();

        authentication = mock(Authentication.class);
        securityContext = mock(SecurityContext.class);
    }

    @Test
    public void testStartShare_Success() {
        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testUser);

            when(meetingRepository.findByMeetingId("meeting-123")).thenReturn(Optional.of(testMeeting));
            when(sessionRepository.save(any(ScreenShareSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

            ScreenShareSession session = screenShareService.startShare("meeting-123", "sess-1", ShareType.FULL_SCREEN);

            assertNotNull(session);
            assertEquals("meeting-123", session.getMeetingId());
            assertEquals("sess-1", session.getSessionId());
            assertEquals(ShareStatus.STARTED, session.getStatus());

            verify(historyRepository).save(any(PresentationHistory.class));
            verify(webrtcService).updateScreenShareState("meeting-123", "user-123", true);
            verify(messagingTemplate).convertAndSend(eq("/topic/screenshare/meeting-123"), ArgumentMatchers.<Object>any());
            verify(messagingTemplate).convertAndSend(eq("/topic/presenter/meeting-123"), ArgumentMatchers.<Object>any());
        }
    }

    @Test
    public void testStopShare_Success() {
        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testUser);

            ScreenShareSession activeSession = ScreenShareSession.builder()
                    .meetingId("meeting-123")
                    .userId("user-123")
                    .sessionId("sess-1")
                    .status(ShareStatus.STARTED)
                    .build();

            when(meetingRepository.findByMeetingId("meeting-123")).thenReturn(Optional.of(testMeeting));
            when(sessionRepository.findByMeetingIdAndUserIdAndStatus("meeting-123", "user-123", ShareStatus.STARTED))
                    .thenReturn(Optional.of(activeSession));

            ScreenShareSession stopped = screenShareService.stopShare("meeting-123", "user-123");

            assertNotNull(stopped);
            assertEquals(ShareStatus.STOPPED, stopped.getStatus());
            assertNotNull(stopped.getEndedAt());

            verify(sessionRepository).save(activeSession);
            verify(webrtcService).updateScreenShareState("meeting-123", "user-123", false);
        }
    }

    @Test
    public void testPauseShare_Success() {
        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testUser);

            ScreenShareSession activeSession = ScreenShareSession.builder()
                    .meetingId("meeting-123")
                    .userId("user-123")
                    .status(ShareStatus.STARTED)
                    .build();

            when(meetingRepository.findByMeetingId("meeting-123")).thenReturn(Optional.of(testMeeting));
            when(sessionRepository.findByMeetingIdAndUserIdAndStatus("meeting-123", "user-123", ShareStatus.STARTED))
                    .thenReturn(Optional.of(activeSession));

            ScreenShareSession paused = screenShareService.pauseShare("meeting-123");

            assertNotNull(paused);
            assertEquals(ShareStatus.PAUSED, paused.getStatus());
            verify(sessionRepository).save(activeSession);
        }
    }

    @Test
    public void testTransferPresenter_Success() {
        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testUser);

            when(meetingRepository.findByMeetingId("meeting-123")).thenReturn(Optional.of(testMeeting));

            MeetingParticipant targetParticipant = MeetingParticipant.builder()
                    .userId("user-456")
                    .username("targetuser")
                    .displayName("Target User")
                    .build();
            when(participantRepository.findByMeetingIdAndUserId("meeting-123", "user-456"))
                    .thenReturn(Optional.of(targetParticipant));

            screenShareService.transferPresenter("meeting-123", "user-456");

            verify(historyRepository).save(any(PresentationHistory.class));
            verify(messagingTemplate).convertAndSend(eq("/topic/presenter/meeting-123"), ArgumentMatchers.<Object>any());
        }
    }

    @Test
    public void testDisableSharing_Success() {
        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testUser);

            when(meetingRepository.findByMeetingId("meeting-123")).thenReturn(Optional.of(testMeeting));

            screenShareService.disableSharing("meeting-123");

            assertFalse(testMeeting.isScreenShareEnabled());
            verify(meetingRepository).save(testMeeting);
        }
    }
}
