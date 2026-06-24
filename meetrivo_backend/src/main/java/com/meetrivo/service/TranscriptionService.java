package com.meetrivo.service;

import com.meetrivo.model.*;
import com.meetrivo.repository.MeetingParticipantRepository;
import com.meetrivo.repository.MeetingRepository;
import com.meetrivo.repository.MeetingTranscriptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TranscriptionService extends BaseService {

    private final MeetingTranscriptRepository transcriptRepository;
    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository participantRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ─── Save Transcript Entry ────────────────────────────────────────────────

    public MeetingTranscript saveTranscript(String meetingId, String text, String language) {
        User speaker = getCurrentUser();
        validateMembership(meetingId);

        MeetingTranscript transcript = MeetingTranscript.builder()
                .meetingId(meetingId)
                .speakerId(speaker.getId())
                .speakerName(speaker.getFullName() != null ? speaker.getFullName() : speaker.getUsername())
                .text(text.trim())
                .language(language != null ? language : "en")
                .timestamp(LocalDateTime.now())
                .build();

        MeetingTranscript saved = transcriptRepository.save(transcript);

        // Broadcast to all meeting participants in real-time
        messagingTemplate.convertAndSend("/topic/transcript/" + meetingId, saved);
        logInfo("Transcript saved for meeting: " + meetingId);

        return saved;
    }

    // ─── Get Full Transcript ──────────────────────────────────────────────────

    public List<MeetingTranscript> getMeetingTranscript(String meetingId) {
        validateMembership(meetingId);
        return transcriptRepository.findByMeetingIdOrderByTimestampAsc(meetingId);
    }

    // ─── Search Transcript ────────────────────────────────────────────────────

    public List<MeetingTranscript> searchTranscript(String meetingId, String keyword) {
        validateMembership(meetingId);
        if (keyword == null || keyword.isBlank()) {
            return transcriptRepository.findByMeetingIdOrderByTimestampAsc(meetingId);
        }
        return transcriptRepository
                .findByMeetingIdAndTextContainingIgnoreCaseOrderByTimestampAsc(meetingId, keyword);
    }

    // ─── Get Speaker Lines ────────────────────────────────────────────────────

    public List<MeetingTranscript> getSpeakerTranscript(String meetingId, String speakerId) {
        validateMembership(meetingId);
        return transcriptRepository
                .findByMeetingIdAndSpeakerIdOrderByTimestampAsc(meetingId, speakerId);
    }

    // ─── Stop / Clear Transcription ───────────────────────────────────────────

    public void clearTranscript(String meetingId) {
        validateHost(meetingId);
        transcriptRepository.deleteByMeetingId(meetingId);
        logInfo("Transcript cleared for meeting: " + meetingId);
    }

    // ─── Transcript Stats ─────────────────────────────────────────────────────

    public long getTranscriptLineCount(String meetingId) {
        return transcriptRepository.countByMeetingId(meetingId);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private void validateMembership(String meetingId) {
        User user = getCurrentUser();
        boolean isMember = participantRepository
                .findByMeetingIdAndUserId(meetingId, user.getId()).isPresent();
        boolean isHost = meetingRepository.findByMeetingId(meetingId)
                .map(m -> m.getHostId().equals(user.getId())).orElse(false);
        if (!isMember && !isHost) {
            throw new RuntimeException("Access denied: You are not a member of this meeting");
        }
    }

    private void validateHost(String meetingId) {
        User user = getCurrentUser();
        meetingRepository.findByMeetingId(meetingId)
                .filter(m -> m.getHostId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Access denied: Only the host can perform this action"));
    }
}
