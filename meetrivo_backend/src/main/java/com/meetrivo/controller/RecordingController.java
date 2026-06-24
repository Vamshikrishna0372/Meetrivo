package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.dto.StartRecordingRequest;
import com.meetrivo.model.MeetingRecording;
import com.meetrivo.model.RecordingHistory;
import com.meetrivo.model.RecordingPermission;
import com.meetrivo.service.RecordingService;
import com.meetrivo.storage.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recordings")
@RequiredArgsConstructor
@Tag(name = "Recording Management", description = "Endpoints for meeting recording, playback, download and sharing")
public class RecordingController {

    private final RecordingService recordingService;
    private final StorageService storageService;

    // ─── Recording Lifecycle ──────────────────────────────────────────────────

    @PostMapping("/start")
    @Operation(summary = "Start Recording", description = "Starts a meeting recording session. Only hosts or co-hosts can initiate.")
    public ApiResponse<MeetingRecording> startRecording(@Valid @RequestBody StartRecordingRequest request) {
        MeetingRecording recording = recordingService.startRecording(
                request.getMeetingId(),
                request.getRecordingType(),
                request.getPermission()
        );
        return ApiResponse.success(recording, "Recording started successfully");
    }

    @PostMapping("/stop")
    @Operation(summary = "Stop Recording", description = "Stops an active recording and transitions it to PROCESSING → COMPLETED.")
    public ApiResponse<MeetingRecording> stopRecording(@RequestParam String recordingId) {
        MeetingRecording recording = recordingService.stopRecording(recordingId);
        return ApiResponse.success(recording, "Recording stopped successfully");
    }

    @PostMapping("/pause")
    @Operation(summary = "Pause Recording", description = "Pauses an active recording session.")
    public ApiResponse<MeetingRecording> pauseRecording(@RequestParam String recordingId) {
        MeetingRecording recording = recordingService.pauseRecording(recordingId);
        return ApiResponse.success(recording, "Recording paused successfully");
    }

    @PostMapping("/resume")
    @Operation(summary = "Resume Recording", description = "Resumes a paused recording session.")
    public ApiResponse<MeetingRecording> resumeRecording(@RequestParam String recordingId) {
        MeetingRecording recording = recordingService.resumeRecording(recordingId);
        return ApiResponse.success(recording, "Recording resumed successfully");
    }

    // ─── Recording Queries ────────────────────────────────────────────────────

    @GetMapping("/{recordingId}")
    @Operation(summary = "Get Recording", description = "Retrieves metadata for a specific recording. Access is governed by recording permission.")
    public ApiResponse<MeetingRecording> getRecording(@PathVariable String recordingId) {
        MeetingRecording recording = recordingService.getRecording(recordingId);
        return ApiResponse.success(recording, "Recording retrieved successfully");
    }

    @GetMapping("/meeting/{meetingId}")
    @Operation(summary = "List Meeting Recordings", description = "Lists all non-deleted recordings for a meeting.")
    public ApiResponse<List<MeetingRecording>> getMeetingRecordings(@PathVariable String meetingId) {
        List<MeetingRecording> recordings = recordingService.getMeetingRecordings(meetingId);
        return ApiResponse.success(recordings, "Recordings retrieved successfully");
    }

    @GetMapping("/my")
    @Operation(summary = "My Recordings", description = "Lists all recordings created by the authenticated user.")
    public ApiResponse<List<MeetingRecording>> getMyRecordings() {
        List<MeetingRecording> recordings = recordingService.getMyRecordings();
        return ApiResponse.success(recordings, "Your recordings retrieved successfully");
    }

    @GetMapping("/shared/{shareToken}")
    @Operation(summary = "Get Shared Recording", description = "Retrieves a recording via a public share token link.")
    public ApiResponse<MeetingRecording> getSharedRecording(@PathVariable String shareToken) {
        MeetingRecording recording = recordingService.getByShareToken(shareToken);
        return ApiResponse.success(recording, "Shared recording retrieved successfully");
    }

    @GetMapping("/{recordingId}/history")
    @Operation(summary = "Get Recording History", description = "Returns the full audit trail of actions performed on a recording.")
    public ApiResponse<List<RecordingHistory>> getRecordingHistory(@PathVariable String recordingId) {
        List<RecordingHistory> history = recordingService.getRecordingHistory(recordingId);
        return ApiResponse.success(history, "Recording history retrieved successfully");
    }

    // ─── Recording Management ─────────────────────────────────────────────────

    @DeleteMapping("/{recordingId}")
    @Operation(summary = "Delete Recording", description = "Soft-deletes a recording. Only hosts or co-hosts can delete.")
    public ApiResponse<String> deleteRecording(@PathVariable String recordingId) {
        recordingService.deleteRecording(recordingId);
        return ApiResponse.success("Recording deleted successfully", "Success");
    }

    @PatchMapping("/{recordingId}/permission")
    @Operation(summary = "Update Recording Permission", description = "Updates visibility: HOST_ONLY | CO_HOST | PARTICIPANTS | PUBLIC.")
    public ApiResponse<MeetingRecording> updatePermission(
            @PathVariable String recordingId,
            @RequestParam RecordingPermission permission) {
        MeetingRecording recording = recordingService.updatePermission(recordingId, permission);
        return ApiResponse.success(recording, "Recording permission updated successfully");
    }

    // ─── Playback & Download ──────────────────────────────────────────────────

    @GetMapping("/play/{recordingId}")
    @Operation(summary = "Play Recording", description = "Streams a completed recording as a byte-range-ready media resource.")
    public ResponseEntity<Resource> playRecording(@PathVariable String recordingId) {
        String storagePath = recordingService.resolvePlaybackPath(recordingId);

        if (storagePath == null || !storageService.exists(storagePath)) {
            return ResponseEntity.notFound().build();
        }

        byte[] bytes = storageService.retrieve(storagePath);
        ByteArrayResource resource = new ByteArrayResource(bytes);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("video/webm"))
                .contentLength(bytes.length)
                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                .body(resource);
    }

    @GetMapping("/download/{recordingId}")
    @Operation(summary = "Download Recording", description = "Downloads a completed recording as a file attachment.")
    public ResponseEntity<Resource> downloadRecording(@PathVariable String recordingId) {
        MeetingRecording recording = recordingService.resolveDownload(recordingId);

        if (recording.getStoragePath() == null || !storageService.exists(recording.getStoragePath())) {
            return ResponseEntity.notFound().build();
        }

        byte[] bytes = storageService.retrieve(recording.getStoragePath());
        ByteArrayResource resource = new ByteArrayResource(bytes);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(bytes.length)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + recording.getFileName() + "\"")
                .body(resource);
    }

    @GetMapping("/play/shared/{shareToken}")
    @Operation(summary = "Play Shared Recording", description = "Streams a publicly shared recording using its token without authentication.")
    public ResponseEntity<Resource> playSharedRecording(@PathVariable String shareToken) {
        String storagePath = recordingService.resolveSharedPlaybackPath(shareToken);

        if (storagePath == null || !storageService.exists(storagePath)) {
            return ResponseEntity.notFound().build();
        }

        byte[] bytes = storageService.retrieve(storagePath);
        ByteArrayResource resource = new ByteArrayResource(bytes);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("video/webm"))
                .contentLength(bytes.length)
                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                .body(resource);
    }

    @GetMapping("/download/shared/{shareToken}")
    @Operation(summary = "Download Shared Recording", description = "Downloads a publicly shared recording using its token without authentication.")
    public ResponseEntity<Resource> downloadSharedRecording(@PathVariable String shareToken) {
        MeetingRecording recording = recordingService.resolveSharedDownload(shareToken);

        if (recording.getStoragePath() == null || !storageService.exists(recording.getStoragePath())) {
            return ResponseEntity.notFound().build();
        }

        byte[] bytes = storageService.retrieve(recording.getStoragePath());
        ByteArrayResource resource = new ByteArrayResource(bytes);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(bytes.length)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + recording.getFileName() + "\"")
                .body(resource);
    }
}
