package com.meetrivo.service;

import com.meetrivo.model.*;
import com.meetrivo.repository.MeetingParticipantRepository;
import com.meetrivo.repository.MeetingRepository;
import com.meetrivo.websocket.MeetingEvent;
import com.meetrivo.websocket.MeetingEventType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MeetingPresenceServiceTest {

    @Mock
    private MeetingRepository meetingRepository;

    @Mock
    private MeetingParticipantRepository meetingParticipantRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private com.meetrivo.util.LoggerUtil logger;

    @InjectMocks
    private MeetingPresenceService presenceService;

    private Meeting testMeeting;
    private MeetingParticipant testParticipant;

    @BeforeEach
    public void setup() {
        presenceService.logger = logger;

        testMeeting = Meeting.builder()
                .meetingId("meeting-123")
                .meetingCode("MTR-123456")
                .hostId("user-123")
                .status(MeetingStatus.ACTIVE)
                .participantCount(0)
                .build();

        testParticipant = MeetingParticipant.builder()
                .meetingId("meeting-123")
                .userId("user-123")
                .username("testuser")
                .role(ParticipantRole.HOST)
                .isActive(true)
                .build();
    }

    @Test
    public void testHandleUserJoined_Host() {
        when(meetingRepository.findByMeetingId("meeting-123")).thenReturn(Optional.of(testMeeting));
        when(meetingParticipantRepository.findByMeetingIdAndUserId("meeting-123", "user-123"))
                .thenReturn(Optional.of(testParticipant));
        when(meetingParticipantRepository.countByMeetingIdAndIsActiveTrue("meeting-123")).thenReturn(1L);
        when(meetingParticipantRepository.findByMeetingIdAndIsActiveTrue("meeting-123"))
                .thenReturn(Collections.singletonList(testParticipant));

        presenceService.handleUserJoined("meeting-123", "user-123");

        assertEquals("ONLINE", testParticipant.getOnlineStatus());
        assertTrue(testParticipant.isActive());

        ArgumentCaptor<MeetingEvent> eventCaptor = ArgumentCaptor.forClass(MeetingEvent.class);
        verify(messagingTemplate).convertAndSend(eq("/topic/participants/meeting-123"), eventCaptor.capture());

        MeetingEvent event = eventCaptor.getValue();
        assertEquals(MeetingEventType.HOST_JOINED, event.getEventType());
        assertEquals("meeting-123", event.getMeetingId());
        assertEquals("user-123", event.getUserId());
        assertEquals("testuser", event.getUsername());
    }

    @Test
    public void testHandleUserLeft() {
        testParticipant.setOnlineStatus("ONLINE");
        when(meetingParticipantRepository.findByMeetingIdAndUserId("meeting-123", "user-123"))
                .thenReturn(Optional.of(testParticipant));
        when(meetingParticipantRepository.countByMeetingIdAndIsActiveTrue("meeting-123")).thenReturn(0L);

        presenceService.handleUserLeft("meeting-123", "user-123");

        assertEquals("OFFLINE", testParticipant.getOnlineStatus());
        assertFalse(testParticipant.isActive());

        ArgumentCaptor<MeetingEvent> eventCaptor = ArgumentCaptor.forClass(MeetingEvent.class);
        verify(messagingTemplate).convertAndSend(eq("/topic/participants/meeting-123"), eventCaptor.capture());

        MeetingEvent event = eventCaptor.getValue();
        assertEquals(MeetingEventType.HOST_LEFT, event.getEventType());
    }

    @Test
    public void testHandleMuteStateChange() {
        when(meetingParticipantRepository.findByMeetingIdAndUserId("meeting-123", "user-123"))
                .thenReturn(Optional.of(testParticipant));

        presenceService.handleMuteStateChange("meeting-123", "user-123", true);

        assertTrue(testParticipant.isMuted());

        ArgumentCaptor<MeetingEvent> eventCaptor = ArgumentCaptor.forClass(MeetingEvent.class);
        verify(messagingTemplate).convertAndSend(eq("/topic/participants/meeting-123"), eventCaptor.capture());

        MeetingEvent event = eventCaptor.getValue();
        assertEquals(MeetingEventType.PARTICIPANT_MUTED, event.getEventType());
    }
}
