package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.dto.ChatMessageResponse;
import com.meetrivo.dto.SendMessageRequest;
import com.meetrivo.model.ReactionType;
import com.meetrivo.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "Chat", description = "Endpoints for in-meeting chat, reactions, and raise hand")
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/send")
    @Operation(summary = "Send Chat Message", description = "Sends a public or private chat message in a meeting room")
    public ApiResponse<ChatMessageResponse> sendMessage(@Valid @RequestBody SendMessageRequest request) {
        return ApiResponse.success(chatService.sendMessage(request), "Message sent successfully");
    }

    @GetMapping("/meeting/{meetingId}")
    @Operation(summary = "Get Chat History", description = "Retrieves all non-deleted public messages for a meeting room")
    public ApiResponse<List<ChatMessageResponse>> getMeetingMessages(@PathVariable String meetingId) {
        return ApiResponse.success(chatService.getMeetingMessages(meetingId), "Chat messages retrieved successfully");
    }

    @PutMapping("/{messageId}")
    @Operation(summary = "Edit Message", description = "Allows the sender to edit their own message")
    public ApiResponse<ChatMessageResponse> editMessage(
            @PathVariable String messageId,
            @RequestBody Map<String, String> body) {
        String newText = body.get("message");
        if (newText == null || newText.isBlank()) {
            throw new RuntimeException("Message content is required");
        }
        return ApiResponse.success(chatService.editMessage(messageId, newText), "Message edited successfully");
    }

    @DeleteMapping("/{messageId}")
    @Operation(summary = "Delete Message", description = "Allows sender or host to soft-delete a message")
    public ApiResponse<String> deleteMessage(@PathVariable String messageId) {
        chatService.deleteMessage(messageId);
        return ApiResponse.success("Message deleted successfully", "Message deleted successfully");
    }

    @PostMapping("/reaction/{meetingId}")
    @Operation(summary = "Send Reaction", description = "Broadcasts an emoji reaction to all participants in the meeting")
    public ApiResponse<String> sendReaction(
            @PathVariable String meetingId,
            @RequestParam ReactionType type) {
        chatService.sendReaction(meetingId, type);
        return ApiResponse.success("Reaction sent successfully", "Reaction sent successfully");
    }

    @PostMapping("/raise-hand/{meetingId}")
    @Operation(summary = "Raise / Lower Hand", description = "Raises or lowers the current user's hand in the meeting")
    public ApiResponse<String> raiseHand(
            @PathVariable String meetingId,
            @RequestParam boolean raised) {
        chatService.raiseHand(meetingId, raised);
        return ApiResponse.success(raised ? "Hand raised" : "Hand lowered", "Success");
    }
}
