package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.model.MeetingSummary;
import com.meetrivo.model.MeetingTranscript;
import com.meetrivo.model.User;
import com.meetrivo.repository.MeetingTranscriptRepository;
import com.meetrivo.service.GroqClient;
import com.meetrivo.service.MeetingSummaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@Tag(name = "AI Assistant", description = "Endpoints for AI-powered meeting summaries, transcripts, and Q&A")
public class AiController {

    private final MeetingSummaryService summaryService;
    private final MeetingTranscriptRepository transcriptRepository;
    private final GroqClient groqClient;

    // ─── POST /api/ai/ask ─────────────────────────────────────────────────────

    @PostMapping("/api/ai/ask")
    @Operation(summary = "Ask AI a question", description = "Ask the Meetrivo AI assistant a contextual question about the meeting or any topic")
    public ApiResponse<Map<String, String>> ask(@RequestBody Map<String, String> body) {
        String question = body.getOrDefault("question", "").trim();
        String meetingId = body.get("meetingId");

        if (question.isEmpty()) {
            return ApiResponse.success(Map.of("answer", "Please provide a question."), "OK");
        }

        String systemPrompt = "You are Meetrivo AI, a helpful meeting assistant. Answer the user's question concisely and professionally.";

        String contextualPrompt = question;
        if (meetingId != null && !meetingId.isBlank()) {
            // Enrich with transcript context if available
            try {
                List<MeetingTranscript> transcripts = transcriptRepository.findByMeetingIdOrderByTimestampAsc(meetingId);
                if (!transcripts.isEmpty()) {
                    String transcriptText = transcripts.stream()
                            .limit(20)
                            .map(t -> t.getSpeakerName() + ": " + t.getText())
                            .collect(Collectors.joining("\n"));
                    contextualPrompt = "Meeting transcript context:\n" + transcriptText + "\n\nUser question: " + question;
                }
            } catch (Exception ignored) {
                // Use question without context if transcript fetch fails
            }
        }

        try {
            String answer = groqClient.complete(systemPrompt, contextualPrompt);
            return ApiResponse.success(Map.of("answer", answer), "AI response generated");
        } catch (Exception e) {
            return ApiResponse.success(
                Map.of("answer", "I'm here to help with your meeting! Unfortunately, I couldn't connect to the AI service at this moment. Please try again shortly."),
                "AI fallback response"
            );
        }
    }

    // ─── GET /api/meetings/{meetingId}/summary ────────────────────────────────

    @GetMapping("/api/meetings/{meetingId}/summary")
    @Operation(summary = "Get Meeting Summary", description = "Returns an AI-generated summary for the meeting. Generates it on-demand if not yet available.")
    public ApiResponse<Map<String, Object>> getMeetingSummary(@PathVariable String meetingId) {
        try {
            MeetingSummary summary = summaryService.getSummary(meetingId);
            Map<String, Object> result = Map.of(
                "summary", summary.getSummary() != null ? summary.getSummary() : "",
                "highlights", summary.getHighlights() != null ? summary.getHighlights() : List.of(),
                "keyPoints", summary.getKeyPoints() != null ? summary.getKeyPoints() : List.of(),
                "generatedAt", summary.getGeneratedAt() != null ? summary.getGeneratedAt().toString() : ""
            );
            return ApiResponse.success(result, "Meeting summary retrieved");
        } catch (Exception e) {
            // Try to generate one
            try {
                MeetingSummary generated = summaryService.generateSummary(meetingId);
                Map<String, Object> result = Map.of(
                    "summary", generated.getSummary() != null ? generated.getSummary() : "Summary generation in progress.",
                    "highlights", generated.getHighlights() != null ? generated.getHighlights() : List.of(),
                    "keyPoints", generated.getKeyPoints() != null ? generated.getKeyPoints() : List.of(),
                    "generatedAt", generated.getGeneratedAt() != null ? generated.getGeneratedAt().toString() : ""
                );
                return ApiResponse.success(result, "Meeting summary generated");
            } catch (Exception ex) {
                return ApiResponse.success(
                    Map.of("summary", "No summary available yet. Summary is generated after the meeting ends.", "highlights", List.of(), "keyPoints", List.of()),
                    "No summary available"
                );
            }
        }
    }

    // ─── GET /api/transcriptions/{meetingId} ──────────────────────────────────

    @GetMapping("/api/transcriptions/{meetingId}")
    @Operation(summary = "Get Meeting Transcript", description = "Returns all transcript segments for a specific meeting, ordered by timestamp")
    public ApiResponse<Map<String, Object>> getTranscript(@PathVariable String meetingId) {
        try {
            List<MeetingTranscript> transcripts = transcriptRepository.findByMeetingIdOrderByTimestampAsc(meetingId);
            String transcriptText = transcripts.stream()
                    .map(t -> "[" + t.getTimestamp() + "] " + t.getSpeakerName() + ": " + t.getText())
                    .collect(Collectors.joining("\n"));
            return ApiResponse.success(
                Map.of(
                    "transcript", transcriptText.isEmpty() ? "No transcript available for this meeting." : transcriptText,
                    "segments", transcripts,
                    "count", transcripts.size()
                ),
                "Transcript retrieved"
            );
        } catch (Exception e) {
            return ApiResponse.success(
                Map.of("transcript", "Transcript data is not available for this meeting.", "segments", List.of(), "count", 0),
                "No transcript"
            );
        }
    }

    // ─── POST /api/ai/summary/{meetingId} ─────────────────────────────────────

    @PostMapping("/api/ai/summary/{meetingId}")
    @Operation(summary = "Generate AI Summary", description = "Triggers on-demand AI summary generation for a meeting")
    public ApiResponse<MeetingSummary> generateSummary(@PathVariable String meetingId) {
        MeetingSummary summary = summaryService.generateSummary(meetingId);
        return ApiResponse.success(summary, "Meeting summary generated successfully");
    }
}
