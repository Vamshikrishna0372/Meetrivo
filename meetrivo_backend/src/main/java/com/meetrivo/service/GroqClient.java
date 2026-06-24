package com.meetrivo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Thin HTTP client for the Groq Chat Completions API.
 * Uses Java's built-in HttpClient — no extra dependencies required.
 * Groq is OpenAI-compatible: POST https://api.groq.com/openai/v1/chat/completions
 */
@Slf4j
@Service
public class GroqClient {

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    @Value("${groq.api.key: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}")
    private String apiKey;

    @Value("${groq.model:llama3-8b-8192}")
    private String defaultModel;

    @Value("${groq.max-tokens:2048}")
    private int maxTokens;

    @Value("${groq.temperature:0.3}")
    private double temperature;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ─── Core: single completion ──────────────────────────────────────────────

    /**
     * Sends a system + user prompt to Groq and returns the assistant's reply text.
     *
     * @param systemPrompt  Instruction context for the model (role/persona/format).
     * @param userMessage   The user-side input to process.
     * @return              The model's response as plain text.
     */
    public String complete(String systemPrompt, String userMessage) {
        return complete(systemPrompt, userMessage, defaultModel);
    }

    public String complete(String systemPrompt, String userMessage, String model) {
        try {
            // Build JSON body
            ObjectNode body = objectMapper.createObjectNode();
            body.put("model", model);
            body.put("max_tokens", maxTokens);
            body.put("temperature", temperature);

            ArrayNode messages = objectMapper.createArrayNode();

            ObjectNode sysMsg = objectMapper.createObjectNode();
            sysMsg.put("role", "system");
            sysMsg.put("content", systemPrompt);
            messages.add(sysMsg);

            ObjectNode userMsg = objectMapper.createObjectNode();
            userMsg.put("role", "user");
            userMsg.put("content", userMessage);
            messages.add(userMsg);

            body.set("messages", messages);

            String requestBody = objectMapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(GROQ_API_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(60))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Groq API error {}: {}", response.statusCode(), response.body());
                return "AI service temporarily unavailable. Please try again later.";
            }

            JsonNode responseJson = objectMapper.readTree(response.body());
            return responseJson
                    .path("choices")
                    .path(0)
                    .path("message")
                    .path("content")
                    .asText("No response generated.");

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Groq request interrupted", e);
            return "AI request was interrupted.";
        } catch (Exception e) {
            log.error("Groq API call failed", e);
            return "AI service error: " + e.getMessage();
        }
    }

    // ─── Convenience: JSON-formatted response ─────────────────────────────────

    /**
     * Sends a prompt instructing Groq to respond in strict JSON.
     * Caller is responsible for parsing the returned string.
     */
    public String completeJson(String systemPrompt, String userMessage) {
        String jsonSystem = systemPrompt + "\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation, no code fences.";
        return complete(jsonSystem, userMessage, defaultModel);
    }

    // ─── Model info ──────────────────────────────────────────────────────────

    public String getDefaultModel() {
        return defaultModel;
    }
}
