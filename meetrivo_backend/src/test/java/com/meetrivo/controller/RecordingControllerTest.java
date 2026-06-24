package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.dto.StartRecordingRequest;
import com.meetrivo.model.MeetingRecording;
import com.meetrivo.model.RecordingHistory;
import com.meetrivo.model.RecordingPermission;
import com.meetrivo.model.RecordingType;
import com.meetrivo.service.RecordingService;
import com.meetrivo.storage.StorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RecordingControllerTest {

    @Mock
    private RecordingService recordingService;

    @Mock
    private StorageService storageService;

    @InjectMocks
    private RecordingController recordingController;

    private MeetingRecording testRecording;

    @BeforeEach
    public void setup() {
        testRecording = MeetingRecording.builder()
                .recordingId("rec-123")
                .meetingId("meeting-123")
                .hostId("user-123")
                .fileName("recording.webm")
                .storagePath("/path/to/recording.webm")
                .fileSize(1024L)
                .duration(300L)
                .recordingType(RecordingType.VIDEO_RECORDING)
                .permission(RecordingPermission.HOST_ONLY)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    public void testStartRecording_Success() {
        StartRecordingRequest request = StartRecordingRequest.builder()
                .meetingId("meeting-123")
                .recordingType(RecordingType.VIDEO_RECORDING)
                .permission(RecordingPermission.HOST_ONLY)
                .build();

        when(recordingService.startRecording("meeting-123", RecordingType.VIDEO_RECORDING, RecordingPermission.HOST_ONLY))
                .thenReturn(testRecording);

        ApiResponse<MeetingRecording> response = recordingController.startRecording(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals(testRecording, response.getData());
    }

    @Test
    public void testStopRecording_Success() {
        when(recordingService.stopRecording("rec-123")).thenReturn(testRecording);

        ApiResponse<MeetingRecording> response = recordingController.stopRecording("rec-123");

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals(testRecording, response.getData());
    }

    @Test
    public void testPauseRecording_Success() {
        when(recordingService.pauseRecording("rec-123")).thenReturn(testRecording);

        ApiResponse<MeetingRecording> response = recordingController.pauseRecording("rec-123");

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals(testRecording, response.getData());
    }

    @Test
    public void testResumeRecording_Success() {
        when(recordingService.resumeRecording("rec-123")).thenReturn(testRecording);

        ApiResponse<MeetingRecording> response = recordingController.resumeRecording("rec-123");

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals(testRecording, response.getData());
    }

    @Test
    public void testGetRecording_Success() {
        when(recordingService.getRecording("rec-123")).thenReturn(testRecording);

        ApiResponse<MeetingRecording> response = recordingController.getRecording("rec-123");

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals(testRecording, response.getData());
    }

    @Test
    public void testGetMeetingRecordings_Success() {
        when(recordingService.getMeetingRecordings("meeting-123")).thenReturn(Collections.singletonList(testRecording));

        ApiResponse<List<MeetingRecording>> response = recordingController.getMeetingRecordings("meeting-123");

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals(1, response.getData().size());
        assertEquals(testRecording, response.getData().get(0));
    }

    @Test
    public void testGetMyRecordings_Success() {
        when(recordingService.getMyRecordings()).thenReturn(Collections.singletonList(testRecording));

        ApiResponse<List<MeetingRecording>> response = recordingController.getMyRecordings();

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals(1, response.getData().size());
        assertEquals(testRecording, response.getData().get(0));
    }

    @Test
    public void testGetSharedRecording_Success() {
        when(recordingService.getByShareToken("token-123")).thenReturn(testRecording);

        ApiResponse<MeetingRecording> response = recordingController.getSharedRecording("token-123");

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals(testRecording, response.getData());
    }

    @Test
    public void testGetRecordingHistory_Success() {
        RecordingHistory historyEntry = RecordingHistory.builder()
                .recordingId("rec-123")
                .action("STARTED")
                .timestamp(LocalDateTime.now())
                .build();
        when(recordingService.getRecordingHistory("rec-123")).thenReturn(Collections.singletonList(historyEntry));

        ApiResponse<List<RecordingHistory>> response = recordingController.getRecordingHistory("rec-123");

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals(1, response.getData().size());
        assertEquals(historyEntry, response.getData().get(0));
    }

    @Test
    public void testDeleteRecording_Success() {
        doNothing().when(recordingService).deleteRecording("rec-123");

        ApiResponse<String> response = recordingController.deleteRecording("rec-123");

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("Recording deleted successfully", response.getData());
    }

    @Test
    public void testUpdatePermission_Success() {
        when(recordingService.updatePermission("rec-123", RecordingPermission.PUBLIC)).thenReturn(testRecording);

        ApiResponse<MeetingRecording> response = recordingController.updatePermission("rec-123", RecordingPermission.PUBLIC);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals(testRecording, response.getData());
    }

    @Test
    public void testPlayRecording_Success() {
        when(recordingService.resolvePlaybackPath("rec-123")).thenReturn("/path/to/recording.webm");
        when(storageService.exists("/path/to/recording.webm")).thenReturn(true);
        when(storageService.retrieve("/path/to/recording.webm")).thenReturn("VIDEO STREAM BYTES".getBytes());

        ResponseEntity<Resource> responseEntity = recordingController.playRecording("rec-123");

        assertNotNull(responseEntity);
        assertEquals(200, responseEntity.getStatusCode().value());
        assertEquals("video/webm", responseEntity.getHeaders().getContentType().toString());
        assertNotNull(responseEntity.getBody());
    }

    @Test
    public void testDownloadRecording_Success() {
        when(recordingService.resolveDownload("rec-123")).thenReturn(testRecording);
        when(storageService.exists("/path/to/recording.webm")).thenReturn(true);
        when(storageService.retrieve("/path/to/recording.webm")).thenReturn("VIDEO DOWNLOAD BYTES".getBytes());

        ResponseEntity<Resource> responseEntity = recordingController.downloadRecording("rec-123");

        assertNotNull(responseEntity);
        assertEquals(200, responseEntity.getStatusCode().value());
        assertTrue(responseEntity.getHeaders().get("Content-Disposition").get(0).contains("attachment"));
        assertNotNull(responseEntity.getBody());
    }
}
