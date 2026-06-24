package com.meetrivo.service;

import com.meetrivo.model.*;
import com.meetrivo.repository.MeetingParticipantRepository;
import com.meetrivo.repository.MeetingRecordingRepository;
import com.meetrivo.repository.MeetingRepository;
import com.meetrivo.repository.RecordingHistoryRepository;
import com.meetrivo.storage.StorageService;
import com.meetrivo.util.LoggerUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.mockito.ArgumentMatchers;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RecordingServiceTest {

    @Mock
    private MeetingRecordingRepository recordingRepository;
    @Mock
    private RecordingHistoryRepository historyRepository;
    @Mock
    private MeetingRepository meetingRepository;
    @Mock
    private MeetingParticipantRepository participantRepository;
    @Mock
    private SimpMessagingTemplate messagingTemplate;
    @Mock
    private StorageService storageService;
    @Mock
    private LoggerUtil logger;
    @Mock
    private AnalyticsService analyticsService;

    @InjectMocks
    private RecordingService recordingService;

    private User testUser;
    private Meeting testMeeting;
    private SecurityContext securityContext;
    private Authentication authentication;

    @BeforeEach
    public void setup() {
        recordingService.logger = logger;

        testUser = User.builder()
                .id("user-123")
                .username("testuser")
                .fullName("Test User")
                .build();

        testMeeting = Meeting.builder()
                .meetingId("meeting-123")
                .hostId("user-123")
                .status(MeetingStatus.ACTIVE)
                .build();

        authentication = mock(Authentication.class);
        securityContext = mock(SecurityContext.class);
    }

    @Test
    public void testStartRecording_Success() {
        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testUser);

            when(meetingRepository.findByMeetingId("meeting-123")).thenReturn(Optional.of(testMeeting));
            when(recordingRepository.findByMeetingIdAndStatusIn(anyString(), anyList()))
                    .thenReturn(Optional.empty());
            when(recordingRepository.save(any(MeetingRecording.class))).thenAnswer(invocation -> invocation.getArgument(0));

            MeetingRecording recording = recordingService.startRecording(
                    "meeting-123", RecordingType.VIDEO_RECORDING, RecordingPermission.HOST_ONLY);

            assertNotNull(recording);
            assertEquals("meeting-123", recording.getMeetingId());
            assertEquals("user-123", recording.getHostId());
            assertEquals(RecordingStatus.RECORDING, recording.getStatus());
            assertEquals(RecordingType.VIDEO_RECORDING, recording.getRecordingType());

            verify(historyRepository).save(any(RecordingHistory.class));
            verify(messagingTemplate).convertAndSend(eq("/topic/recording/meeting-123"), ArgumentMatchers.<Object>any());
        }
    }

    @Test
    public void testStartRecording_AlreadyInProgress() {
        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testUser);

            when(meetingRepository.findByMeetingId("meeting-123")).thenReturn(Optional.of(testMeeting));
            
            MeetingRecording activeRecording = MeetingRecording.builder()
                    .meetingId("meeting-123")
                    .status(RecordingStatus.RECORDING)
                    .build();
            when(recordingRepository.findByMeetingIdAndStatusIn(anyString(), anyList()))
                    .thenReturn(Optional.of(activeRecording));

            Exception exception = assertThrows(RuntimeException.class, () -> {
                recordingService.startRecording("meeting-123", RecordingType.VIDEO_RECORDING, RecordingPermission.HOST_ONLY);
            });

            assertEquals("A recording is already in progress for this meeting", exception.getMessage());
        }
    }

    @Test
    public void testStopRecording_Success() {
        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testUser);

            when(meetingRepository.findByMeetingId("meeting-123")).thenReturn(Optional.of(testMeeting));

            MeetingRecording recording = MeetingRecording.builder()
                    .recordingId("rec-123")
                    .meetingId("meeting-123")
                    .hostId("user-123")
                    .fileName("recording.webm")
                    .status(RecordingStatus.RECORDING)
                    .startedAt(LocalDateTime.now().minusMinutes(5))
                    .build();

            when(recordingRepository.findByRecordingId("rec-123")).thenReturn(Optional.of(recording));
            when(storageService.store(any(InputStream.class), anyString(), anyString())).thenReturn("/path/to/recording.webm");
            when(storageService.size("/path/to/recording.webm")).thenReturn(1024L);
            when(recordingRepository.save(any(MeetingRecording.class))).thenAnswer(invocation -> invocation.getArgument(0));

            MeetingRecording stopped = recordingService.stopRecording("rec-123");

            assertNotNull(stopped);
            assertEquals(RecordingStatus.COMPLETED, stopped.getStatus());
            assertEquals("/path/to/recording.webm", stopped.getStoragePath());
            assertEquals(1024L, stopped.getFileSize());
            assertNotNull(stopped.getDuration());

            verify(historyRepository).save(any(RecordingHistory.class));
            verify(messagingTemplate).convertAndSend(eq("/topic/recording/meeting-123"), ArgumentMatchers.<Object>any());
        }
    }

    @Test
    public void testPauseRecording_Success() {
        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testUser);

            when(meetingRepository.findByMeetingId("meeting-123")).thenReturn(Optional.of(testMeeting));

            MeetingRecording recording = MeetingRecording.builder()
                    .recordingId("rec-123")
                    .meetingId("meeting-123")
                    .hostId("user-123")
                    .status(RecordingStatus.RECORDING)
                    .build();

            when(recordingRepository.findByRecordingId("rec-123")).thenReturn(Optional.of(recording));
            when(recordingRepository.save(any(MeetingRecording.class))).thenAnswer(invocation -> invocation.getArgument(0));

            MeetingRecording paused = recordingService.pauseRecording("rec-123");

            assertNotNull(paused);
            assertEquals(RecordingStatus.PAUSED, paused.getStatus());
            assertNotNull(paused.getPausedAt());

            verify(historyRepository).save(any(RecordingHistory.class));
            verify(messagingTemplate).convertAndSend(eq("/topic/recording/meeting-123"), ArgumentMatchers.<Object>any());
        }
    }

    @Test
    public void testResumeRecording_Success() {
        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testUser);

            when(meetingRepository.findByMeetingId("meeting-123")).thenReturn(Optional.of(testMeeting));

            MeetingRecording recording = MeetingRecording.builder()
                    .recordingId("rec-123")
                    .meetingId("meeting-123")
                    .hostId("user-123")
                    .status(RecordingStatus.PAUSED)
                    .build();

            when(recordingRepository.findByRecordingId("rec-123")).thenReturn(Optional.of(recording));
            when(recordingRepository.save(any(MeetingRecording.class))).thenAnswer(invocation -> invocation.getArgument(0));

            MeetingRecording resumed = recordingService.resumeRecording("rec-123");

            assertNotNull(resumed);
            assertEquals(RecordingStatus.RECORDING, resumed.getStatus());
            assertNotNull(resumed.getResumedAt());

            verify(historyRepository).save(any(RecordingHistory.class));
            verify(messagingTemplate).convertAndSend(eq("/topic/recording/meeting-123"), ArgumentMatchers.<Object>any());
        }
    }

    @Test
    public void testDeleteRecording_Success() {
        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testUser);

            when(meetingRepository.findByMeetingId("meeting-123")).thenReturn(Optional.of(testMeeting));

            MeetingRecording recording = MeetingRecording.builder()
                    .recordingId("rec-123")
                    .meetingId("meeting-123")
                    .hostId("user-123")
                    .status(RecordingStatus.COMPLETED)
                    .build();

            when(recordingRepository.findByRecordingId("rec-123")).thenReturn(Optional.of(recording));
            when(recordingRepository.save(any(MeetingRecording.class))).thenAnswer(invocation -> invocation.getArgument(0));

            recordingService.deleteRecording("rec-123");

            assertEquals(RecordingStatus.DELETED, recording.getStatus());
            verify(historyRepository).save(any(RecordingHistory.class));
        }
    }

    @Test
    public void testResolvePlaybackPath_Success() {
        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testUser);

            when(meetingRepository.findByMeetingId("meeting-123")).thenReturn(Optional.of(testMeeting));

            MeetingRecording recording = MeetingRecording.builder()
                    .recordingId("rec-123")
                    .meetingId("meeting-123")
                    .hostId("user-123")
                    .status(RecordingStatus.COMPLETED)
                    .storagePath("/path/to/recording.webm")
                    .permission(RecordingPermission.HOST_ONLY)
                    .build();

            when(recordingRepository.findByRecordingId("rec-123")).thenReturn(Optional.of(recording));

            String path = recordingService.resolvePlaybackPath("rec-123");

            assertEquals("/path/to/recording.webm", path);
        }
    }

    @Test
    public void testResolvePlaybackPath_AccessDenied() {
        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            
            User outsider = User.builder().id("outsider").username("outsider").build();
            when(authentication.getPrincipal()).thenReturn(outsider);

            when(meetingRepository.findByMeetingId("meeting-123")).thenReturn(Optional.of(testMeeting));

            MeetingRecording recording = MeetingRecording.builder()
                    .recordingId("rec-123")
                    .meetingId("meeting-123")
                    .hostId("user-123")
                    .status(RecordingStatus.COMPLETED)
                    .storagePath("/path/to/recording.webm")
                    .permission(RecordingPermission.HOST_ONLY)
                    .build();

            when(recordingRepository.findByRecordingId("rec-123")).thenReturn(Optional.of(recording));

            assertThrows(RuntimeException.class, () -> {
                recordingService.resolvePlaybackPath("rec-123");
            });
        }
    }
}
