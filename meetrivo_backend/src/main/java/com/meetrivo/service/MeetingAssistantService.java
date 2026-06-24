package com.meetrivo.service;

import com.meetrivo.model.*;
import com.meetrivo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeetingAssistantService extends BaseService {

    private final MeetingTranscriptRepository transcriptRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository participantRepository;
    private final GroqClient groqClient;

    private static final String ASSISTANT_SYSTEM = """
            You are a highly intelligent meeting assistant for Meetrivo.
            You have access to meeting transcripts and chat messages.
            Answer questions clearly and concisely based only on the meeting content provided.
            If the answer is not in the provided content, say so honestly.
            Never fabricate information. Keep answers professional and focused.
            """;

    // ─── Ask a General Question ───────────────────────────────────────────────

    public String askQuestion(String meetingId, String question) {
        validateAccess(meetingId);
        String context = buildContext(meetingId);

        String prompt = "Meeting Content:\n" + context
                + "\n\nUser Question: " + question
                + "\n\nAnswer based on the meeting content above:";

        return groqClient.complete(ASSISTANT_SYSTEM, prompt);
    }

    // ─── Search Meeting Content ───────────────────────────────────────────────

    public String searchMeeting(String meetingId, String query) {
        validateAccess(meetingId);
        String context = buildContext(meetingId);

        String prompt = "Meeting Content:\n" + context
                + "\n\nSearch Query: " + query
                + "\n\nFind and summarize all relevant parts of the meeting content that match the above query:";

        return groqClient.complete(ASSISTANT_SYSTEM, prompt);
    }

    // ─── Find Decisions ───────────────────────────────────────────────────────

    public String findDecisions(String meetingId) {
        validateAccess(meetingId);
        String context = buildContext(meetingId);

        String prompt = "Meeting Content:\n" + context
                + "\n\nIdentify and list all decisions made during this meeting. "
                + "Format as a numbered list. If no decisions were made, say so clearly.";

        return groqClient.complete(ASSISTANT_SYSTEM, prompt);
    }

    // ─── Find Tasks / Assignments ─────────────────────────────────────────────

    public String findTasks(String meetingId) {
        validateAccess(meetingId);
        String context = buildContext(meetingId);

        String prompt = "Meeting Content:\n" + context
                + "\n\nIdentify all tasks and assignments mentioned in the meeting. "
                + "Format as: 'Task: [description] — Assigned to: [person or Unassigned]'. "
                + "If no tasks were mentioned, say so clearly.";

        return groqClient.complete(ASSISTANT_SYSTEM, prompt);
    }

    // ─── Find Participant Discussion ──────────────────────────────────────────

    public String findParticipantDiscussion(String meetingId, String participantName) {
        validateAccess(meetingId);
        String context = buildContext(meetingId);

        String prompt = "Meeting Content:\n" + context
                + "\n\nSummarize everything said or written by participant: " + participantName
                + "\nInclude both transcript lines and chat messages. "
                + "If this participant is not found in the content, say so clearly.";

        return groqClient.complete(ASSISTANT_SYSTEM, prompt);
    }

    // ─── Meeting Insights ─────────────────────────────────────────────────────

    public String getMeetingInsights(String meetingId) {
        validateAccess(meetingId);
        String context = buildContext(meetingId);

        String prompt = "Meeting Content:\n" + context
                + "\n\nProvide a comprehensive insights report including: "
                + "1) Overall meeting effectiveness, "
                + "2) Most active participants, "
                + "3) Topics discussed, "
                + "4) Meeting tone and sentiment, "
                + "5) Any notable moments or concerns.";

        return groqClient.complete(ASSISTANT_SYSTEM, prompt);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private String buildContext(String meetingId) {
        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        List<MeetingTranscript> transcripts = transcriptRepository
                .findByMeetingIdOrderByTimestampAsc(meetingId);
        List<ChatMessage> chats = chatMessageRepository
                .findByMeetingIdOrderByTimestampAsc(meetingId);

        StringBuilder sb = new StringBuilder();
        sb.append("Title: ").append(meeting.getTitle()).append("\n");
        sb.append("Host: ").append(meeting.getHostName()).append("\n\n");

        if (!transcripts.isEmpty()) {
            sb.append("=== TRANSCRIPT ===\n");
            transcripts.forEach(t ->
                sb.append("[").append(t.getSpeakerName()).append("]: ").append(t.getText()).append("\n")
            );
        }

        if (!chats.isEmpty()) {
            sb.append("\n=== CHAT MESSAGES ===\n");
            chats.stream()
                    .filter(c -> c.getMessage() != null && !c.getMessage().isBlank())
                    .forEach(c ->
                        sb.append("[").append(c.getSenderName()).append("]: ").append(c.getMessage()).append("\n")
                    );
        }

        return sb.toString();
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private void validateAccess(String meetingId) {
        User user = getCurrentUser();
        boolean isHost = meetingRepository.findByMeetingId(meetingId)
                .map(m -> m.getHostId().equals(user.getId())).orElse(false);
        boolean isMember = participantRepository.findByMeetingIdAndUserId(meetingId, user.getId()).isPresent();
        if (!isHost && !isMember) {
            throw new RuntimeException("Access denied: Not a member of this meeting");
        }
    }
}
