package com.meetrivo.service;

import com.meetrivo.dto.*;
import com.meetrivo.model.*;
import com.meetrivo.repository.MeetingParticipantRepository;
import com.meetrivo.repository.MeetingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MeetingServiceTest {

    @Mock
    private MeetingRepository meetingRepository;

    @Mock
    private MeetingParticipantRepository meetingParticipantRepository;

    @Mock
    private MongoTemplate mongoTemplate;

    @Mock
    private com.meetrivo.util.LoggerUtil logger;

    @Mock
    private AnalyticsService analyticsService;

    @Mock
    private MeetingPresenceService presenceService;

    @Mock
    private AttendanceService attendanceService;

    @InjectMocks
    private MeetingService meetingService;

    @InjectMocks
    private JoinService joinService;

    private User testUser;
    private Meeting testMeeting;
    private SecurityContext securityContext;
    private Authentication authentication;

    @BeforeEach
    public void setup() {
        testUser = User.builder()
                .id("user-123")
                .username("testuser")
                .fullName("Test User")
                .email("testuser@meetrivo.com")
                .build();

        testMeeting = Meeting.builder()
                .id("db-123")
                .meetingId("meeting-uuid")
                .meetingCode("MTR-123456")
                .title("Test Meeting")
                .description("Test Description")
                .hostId("user-123")
                .hostName("Test User")
                .status(MeetingStatus.SCHEDULED)
                .visibility(MeetingVisibility.PUBLIC)
                .passwordProtected(false)
                .joinLink("http://localhost:8080/join/meeting-uuid")
                .participantCount(0)
                .build();

        authentication = mock(Authentication.class);
        securityContext = mock(SecurityContext.class);

        meetingService.logger = logger;
        joinService.logger = logger;
    }

    @Test
    public void testCreateMeeting_Instant() {
        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testUser);

            CreateMeetingRequest request = CreateMeetingRequest.builder()
                    .title("Instant Meeting")
                    .description("Instant Desc")
                    .scheduled(false)
                    .passwordProtected(false)
                    .visibility("PUBLIC")
                    .build();

            when(meetingRepository.existsByMeetingCode(anyString())).thenReturn(false);
            when(meetingRepository.save(any(Meeting.class))).thenAnswer(invocation -> invocation.getArgument(0));

            MeetingResponse response = meetingService.createMeeting(request);

            assertNotNull(response);
            assertEquals("Instant Meeting", response.getTitle());
            assertEquals("user-123", response.getHostId());
            assertEquals(MeetingStatus.ACTIVE, response.getStatus()); // Instant starts ACTIVE
            assertNotNull(response.getMeetingId());
            assertNotNull(response.getMeetingCode());
            assertTrue(response.getMeetingCode().startsWith("MTR-"));
        }
    }

    @Test
    public void testStartMeeting_Success() {
        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testUser);

            when(meetingRepository.findByMeetingId("meeting-uuid")).thenReturn(Optional.of(testMeeting));
            when(meetingRepository.save(any(Meeting.class))).thenAnswer(invocation -> invocation.getArgument(0));

            MeetingResponse response = meetingService.startMeeting("meeting-uuid");

            assertNotNull(response);
            assertEquals(MeetingStatus.ACTIVE, response.getStatus());
            assertNotNull(response.getActualStartTime());
        }
    }

    @Test
    public void testStartMeeting_ForbiddenForNonHost() {
        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            
            User nonHost = User.builder().id("other-user").username("other").build();
            when(authentication.getPrincipal()).thenReturn(nonHost);

            when(meetingRepository.findByMeetingId("meeting-uuid")).thenReturn(Optional.of(testMeeting));

            Exception exception = assertThrows(RuntimeException.class, () -> {
                meetingService.startMeeting("meeting-uuid");
            });

            assertEquals("Only the host can perform this action", exception.getMessage());
        }
    }

    @Test
    public void testJoinMeeting_Success() {
        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testUser);

            // Meeting must be active to join
            testMeeting.setStatus(MeetingStatus.ACTIVE);

            when(meetingRepository.findByMeetingId("meeting-uuid")).thenReturn(Optional.of(testMeeting));
            when(meetingParticipantRepository.findByMeetingIdAndUserId("meeting-uuid", "user-123"))
                    .thenReturn(Optional.empty());
            when(meetingParticipantRepository.save(any(MeetingParticipant.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));
            when(meetingParticipantRepository.countByMeetingIdAndIsActiveTrue("meeting-uuid")).thenReturn(1L);

            JoinMeetingRequest request = JoinMeetingRequest.builder()
                    .meetingIdentifier("meeting-uuid")
                    .build();

            ParticipantResponse response = joinService.joinMeeting(request);

            assertNotNull(response);
            assertEquals("user-123", response.getUserId());
            assertEquals(ParticipantRole.HOST, response.getRole()); // Host is host-user
            assertTrue(response.isActive());
        }
    }

    @Test
    public void testJoinMeeting_PasswordProtection() {
        testMeeting.setStatus(MeetingStatus.ACTIVE);
        testMeeting.setPasswordProtected(true);
        testMeeting.setMeetingPassword("secret123");

        when(meetingRepository.findByMeetingId("meeting-uuid")).thenReturn(Optional.of(testMeeting));

        // Join with wrong password
        JoinMeetingRequest wrongRequest = JoinMeetingRequest.builder()
                .meetingIdentifier("meeting-uuid")
                .password("wrongpassword")
                .build();

        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testUser);

            Exception exception = assertThrows(RuntimeException.class, () -> {
                joinService.joinMeeting(wrongRequest);
            });

            assertEquals("Invalid meeting password", exception.getMessage());
        }
    }
}
