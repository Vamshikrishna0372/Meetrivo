package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.dto.StartShareRequest;
import com.meetrivo.model.*;
import com.meetrivo.service.ScreenShareService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ScreenShareControllerTest {

    @Mock
    private ScreenShareService screenShareService;

    @InjectMocks
    private ScreenShareController screenShareController;

    private User testUser;
    private SecurityContext securityContext;
    private Authentication authentication;

    @BeforeEach
    public void setup() {
        testUser = User.builder()
                .id("user-123")
                .username("testuser")
                .build();

        authentication = mock(Authentication.class);
        securityContext = mock(SecurityContext.class);
    }

    @Test
    public void testStartShare_Success() {
        StartShareRequest request = StartShareRequest.builder()
                .meetingId("meeting-123")
                .sessionId("sess-1")
                .shareType(ShareType.FULL_SCREEN)
                .build();

        ScreenShareSession expectedSession = ScreenShareSession.builder()
                .id("id-1")
                .meetingId("meeting-123")
                .userId("user-123")
                .sessionId("sess-1")
                .shareType(ShareType.FULL_SCREEN)
                .status(ShareStatus.STARTED)
                .build();

        when(screenShareService.startShare("meeting-123", "sess-1", ShareType.FULL_SCREEN))
                .thenReturn(expectedSession);

        ApiResponse<ScreenShareSession> response = screenShareController.startShare(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals(expectedSession, response.getData());
    }

    @Test
    public void testStopShare_Success() {
        try (MockedStatic<SecurityContextHolder> utilities = Mockito.mockStatic(SecurityContextHolder.class)) {
            utilities.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(testUser);

            ScreenShareSession expectedSession = ScreenShareSession.builder()
                    .id("id-1")
                    .meetingId("meeting-123")
                    .userId("user-123")
                    .status(ShareStatus.STOPPED)
                    .build();

            when(screenShareService.stopShare("meeting-123", "user-123"))
                    .thenReturn(expectedSession);

            ApiResponse<ScreenShareSession> response = screenShareController.stopShare("meeting-123", null);

            assertNotNull(response);
            assertTrue(response.isSuccess());
            assertEquals(expectedSession, response.getData());
        }
    }

    @Test
    public void testGetShareStatus_Success() {
        PresentationHistory expectedPresenter = PresentationHistory.builder()
                .meetingId("meeting-123")
                .presenterId("user-123")
                .presenterName("Test User")
                .active(true)
                .build();

        when(screenShareService.getCurrentPresenter("meeting-123"))
                .thenReturn(Optional.of(expectedPresenter));

        ApiResponse<PresentationHistory> response = screenShareController.getShareStatus("meeting-123");

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals(expectedPresenter, response.getData());
    }
}
