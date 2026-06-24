package com.meetrivo.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.meetrivo.model.*;
import com.meetrivo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeetingSummaryService extends BaseService {

    private final MeetingSummaryRepository summaryRepository;
    private final MeetingTranscriptRepository transcriptRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository participantRepository;
    private final ActionItemRepository actionItemRepository;
    private final GroqClient groqClient;
    private final ObjectMapper objectMapper;

    private static final String SYSTEM_PROMPT = """
            You are an expert AI meeting assistant for Meetrivo, a professional video conferencing platform.
            Your job is to analyze meeting transcripts and chat messages and produce structured, professional outputs.
            Always respond with valid JSON only — no markdown, no code fences, no extra text.
            Be concise, accurate, and professional.
            """;

    // ─── Generate Full AI Summary ─────────────────────────────────────────────

    public MeetingSummary generateSummary(String meetingId) {
        validateAccess(meetingId);

        Meeting meeting = meetingRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found: " + meetingId));

        List<MeetingTranscript> transcripts = transcriptRepository
                .findByMeetingIdOrderByTimestampAsc(meetingId);
        List<ChatMessage> chats = chatMessageRepository
                .findByMeetingIdOrderByTimestampAsc(meetingId);

        String context = buildContext(meeting, transcripts, chats);

        // Call Groq
        String prompt = """
                Analyze the following meeting context and return a JSON object with these exact fields:
                {
                  "summary": "2-3 sentence meeting summary",
                  "keyPoints": ["point1", "point2", "point3"],
                  "actionItems": ["action1", "action2"],
                  "keyDecisions": ["decision1", "decision2"],
                  "highlights": ["highlight1", "highlight2"],
                  "sentiment": "POSITIVE|NEUTRAL|NEGATIVE"
                }
                Meeting Context:
                """ + context;

        String aiResponse = groqClient.completeJson(SYSTEM_PROMPT, prompt);

        // Parse AI response
        MeetingSummary summary = parseSummaryResponse(aiResponse, meeting, transcripts, chats);

        // Persist (replace if exists)
        summaryRepository.findByMeetingId(meetingId).ifPresent(existing -> {
            summary.setId(existing.getId());
        });
        MeetingSummary saved = summaryRepository.save(summary);
        logInfo("AI summary generated for meeting: " + meetingId);

        return saved;
    }

    // ─── Generate Only Key Points ─────────────────────────────────────────────

    public List<String> generateKeyPoints(String meetingId) {
        MeetingSummary summary = getOrGenerate(meetingId);
        return summary.getKeyPoints() != null ? summary.getKeyPoints() : List.of();
    }

    // ─── Generate Action Items ────────────────────────────────────────────────

    public List<ActionItem> generateActionItems(String meetingId) {
        validateAccess(meetingId);

        List<MeetingTranscript> transcripts = transcriptRepository.findByMeetingIdOrderByTimestampAsc(meetingId);
        List<ChatMessage> chats = chatMessageRepository.findByMeetingIdOrderByTimestampAsc(meetingId);

        String prompt = """
                Extract specific action items from the meeting below. Return a JSON array of objects:
                [{"task": "...", "assignedTo": "person name or 'Unassigned'", "priority": "LOW|MEDIUM|HIGH|URGENT"}]
                
                Meeting Transcript:
                """ + buildTranscriptText(transcripts) + "\n\nChat:\n" + buildChatText(chats);

        String aiResponse = groqClient.completeJson(SYSTEM_PROMPT, prompt);

        List<ActionItem> items = parseActionItems(aiResponse, meetingId);
        items = actionItemRepository.saveAll(items);
        logInfo("Generated " + items.size() + " action items for meeting: " + meetingId);
        return items;
    }

    // ─── Generate Highlights ──────────────────────────────────────────────────

    public List<String> generateHighlights(String meetingId) {
        MeetingSummary summary = getOrGenerate(meetingId);
        return summary.getHighlights() != null ? summary.getHighlights() : List.of();
    }

    // ─── Get Existing Summary ─────────────────────────────────────────────────

    public MeetingSummary getSummary(String meetingId) {
        validateAccess(meetingId);
        return summaryRepository.findByMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("No summary found. Call POST /api/ai/summary/" + meetingId + " first."));
    }

    // ─── Speaker Analytics ────────────────────────────────────────────────────

    public List<MeetingSummary.SpeakerStat> getSpeakerStats(String meetingId) {
        validateAccess(meetingId);
        List<MeetingTranscript> transcripts = transcriptRepository.findByMeetingIdOrderByTimestampAsc(meetingId);
        List<ChatMessage> chats = chatMessageRepository.findByMeetingIdOrderByTimestampAsc(meetingId);

        Map<String, MeetingSummary.SpeakerStat> stats = new LinkedHashMap<>();

        transcripts.forEach(t -> {
            stats.computeIfAbsent(t.getSpeakerId(), id ->
                MeetingSummary.SpeakerStat.builder()
                    .speakerId(id)
                    .speakerName(t.getSpeakerName())
                    .messageCount(0)
                    .transcriptLines(0)
                    .build()
            ).setTranscriptLines(stats.get(t.getSpeakerId()).getTranscriptLines() + 1);
        });

        chats.forEach(c -> {
            stats.computeIfAbsent(c.getSenderId(), id ->
                MeetingSummary.SpeakerStat.builder()
                    .speakerId(id)
                    .speakerName(c.getSenderName())
                    .messageCount(0)
                    .transcriptLines(0)
                    .build()
            ).setMessageCount(stats.get(c.getSenderId()).getMessageCount() + 1);
        });

        return new ArrayList<>(stats.values());
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private MeetingSummary getOrGenerate(String meetingId) {
        return summaryRepository.findByMeetingId(meetingId)
                .orElseGet(() -> generateSummary(meetingId));
    }

    private String buildContext(Meeting meeting, List<MeetingTranscript> transcripts, List<ChatMessage> chats) {
        StringBuilder sb = new StringBuilder();
        sb.append("Meeting Title: ").append(meeting.getTitle()).append("\n");
        sb.append("Host: ").append(meeting.getHostName()).append("\n");
        if (meeting.getActualStartTime() != null && meeting.getActualEndTime() != null) {
            long minutes = ChronoUnit.MINUTES.between(meeting.getActualStartTime(), meeting.getActualEndTime());
            sb.append("Duration: ").append(minutes).append(" minutes\n");
        }
        sb.append("\n--- TRANSCRIPT ---\n");
        sb.append(buildTranscriptText(transcripts));
        sb.append("\n--- CHAT ---\n");
        sb.append(buildChatText(chats));
        return sb.toString();
    }

    private String buildTranscriptText(List<MeetingTranscript> transcripts) {
        return transcripts.stream()
                .map(t -> "[" + t.getSpeakerName() + "]: " + t.getText())
                .collect(Collectors.joining("\n"));
    }

    private String buildChatText(List<ChatMessage> chats) {
        return chats.stream()
                .filter(c -> c.getMessage() != null && !c.getMessage().isBlank())
                .map(c -> "[" + c.getSenderName() + "]: " + c.getMessage())
                .collect(Collectors.joining("\n"));
    }

    private MeetingSummary parseSummaryResponse(String json, Meeting meeting,
                                                 List<MeetingTranscript> transcripts,
                                                 List<ChatMessage> chats) {
        String summary = "AI summary could not be generated.";
        List<String> keyPoints = new ArrayList<>();
        List<String> actionItems = new ArrayList<>();
        List<String> keyDecisions = new ArrayList<>();
        List<String> highlights = new ArrayList<>();
        String sentiment = "NEUTRAL";

        try {
            Map<String, Object> parsed = objectMapper.readValue(json, new TypeReference<>() {});
            summary     = (String) parsed.getOrDefault("summary", summary);
            keyPoints   = castList(parsed.get("keyPoints"));
            actionItems = castList(parsed.get("actionItems"));
            keyDecisions= castList(parsed.get("keyDecisions"));
            highlights  = castList(parsed.get("highlights"));
            sentiment   = (String) parsed.getOrDefault("sentiment", "NEUTRAL");
        } catch (Exception e) {
            logError("Failed to parse Groq summary response", e);
        }

        int duration = 0;
        if (meeting.getActualStartTime() != null && meeting.getActualEndTime() != null) {
            duration = (int) ChronoUnit.MINUTES.between(meeting.getActualStartTime(), meeting.getActualEndTime());
        }

        return MeetingSummary.builder()
                .meetingId(meeting.getMeetingId())
                .meetingTitle(meeting.getTitle())
                .summary(summary)
                .keyPoints(keyPoints)
                .actionItems(actionItems)
                .keyDecisions(keyDecisions)
                .highlights(highlights)
                .sentiment(sentiment)
                .totalMessages(chats.size())
                .totalParticipants(participantRepository.findByMeetingId(meeting.getMeetingId()).size())
                .durationMinutes(duration)
                .speakerStats(getSpeakerStats(meeting.getMeetingId()))
                .modelUsed(groqClient.getDefaultModel())
                .generatedAt(LocalDateTime.now())
                .build();
    }

    @SuppressWarnings("unchecked")
    private List<String> castList(Object obj) {
        if (obj instanceof List<?> list) {
            return list.stream().map(Object::toString).collect(Collectors.toList());
        }
        return new ArrayList<>();
    }

    private List<ActionItem> parseActionItems(String json, String meetingId) {
        List<ActionItem> result = new ArrayList<>();
        User creator = getCurrentUser();
        try {
            List<Map<String, Object>> parsed = objectMapper.readValue(json, new TypeReference<>() {});
            for (Map<String, Object> item : parsed) {
                String priorityStr = (String) item.getOrDefault("priority", "MEDIUM");
                ActionItemPriority priority;
                try { priority = ActionItemPriority.valueOf(priorityStr.toUpperCase()); }
                catch (Exception e) { priority = ActionItemPriority.MEDIUM; }

                result.add(ActionItem.builder()
                        .meetingId(meetingId)
                        .task((String) item.getOrDefault("task", ""))
                        .assignedToName((String) item.getOrDefault("assignedTo", "Unassigned"))
                        .priority(priority)
                        .status(ActionItemStatus.OPEN)
                        .createdByUserId(creator.getId())
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build());
            }
        } catch (Exception e) {
            logError("Failed to parse Groq action items response", e);
        }
        return result;
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
