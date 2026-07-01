package com.meetrivo.service;

import com.meetrivo.dto.WhiteboardData;
import com.meetrivo.model.*;
import com.meetrivo.repository.WhiteboardElementRepository;
import com.meetrivo.repository.WhiteboardSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WhiteboardService extends BaseService {

    private final WhiteboardSessionRepository whiteboardSessionRepository;
    private final WhiteboardElementRepository whiteboardElementRepository;

    public WhiteboardData getWhiteboard(String meetingId) {
        logInfo("Retrieving whiteboard elements for meeting: " + meetingId);
        List<WhiteboardElement> elements = whiteboardElementRepository.findByMeetingIdAndDeletedFalseOrderByCreatedAtAsc(meetingId);
        
        // Ensure tool and size fields are populated for the frontend
        for (WhiteboardElement el : elements) {
            if (el.getTool() == null && el.getElementType() != null) {
                el.setTool(el.getElementType().name().toLowerCase());
            }
            if (el.getSize() == 0 && el.getStrokeWidth() > 0) {
                el.setSize(el.getStrokeWidth());
            }
        }
        
        return new WhiteboardData(elements);
    }

    public WhiteboardData saveWhiteboard(String meetingId, WhiteboardData data) {
        User user = getCurrentUser();
        logInfo("Saving whiteboard elements for meeting: " + meetingId + " by user: " + user.getUsername());

        List<WhiteboardElement> elements = data.getStrokes();
        if (elements == null) {
            return getWhiteboard(meetingId);
        }

        // Find or create session
        WhiteboardSession session = whiteboardSessionRepository.findByMeetingId(meetingId)
                .orElseGet(() -> {
                    WhiteboardSession newSession = WhiteboardSession.builder()
                            .meetingId(meetingId)
                            .ownerId(user.getId())
                            .createdAt(LocalDateTime.now())
                            .status(WhiteboardStatus.ACTIVE)
                            .build();
                    return whiteboardSessionRepository.save(newSession);
                });

        // Delete old elements for this session/meeting to refresh state
        List<WhiteboardElement> existing = whiteboardElementRepository.findByMeetingIdAndDeletedFalseOrderByCreatedAtAsc(meetingId);
        for (WhiteboardElement el : existing) {
            el.setDeleted(true);
            whiteboardElementRepository.save(el);
        }

        // Save new elements
        for (WhiteboardElement el : elements) {
            el.setId(null); // Reset ID to let MongoDB generate a clean ID
            el.setSessionId(session.getId());
            el.setMeetingId(meetingId);
            el.setCreatedBy(user.getId());
            el.setCreatedByName(user.getFullName() != null ? user.getFullName() : user.getUsername());
            el.setCreatedAt(LocalDateTime.now());
            el.setUpdatedAt(LocalDateTime.now());
            el.setDeleted(false);

            // Sync database properties and frontend properties
            if (el.getTool() != null) {
                String tool = el.getTool().toLowerCase();
                if ("pen".equals(tool)) el.setElementType(WhiteboardElementType.PEN);
                else if ("eraser".equals(tool)) el.setElementType(WhiteboardElementType.ERASER);
                else if ("line".equals(tool)) el.setElementType(WhiteboardElementType.LINE);
                else if ("rect".equals(tool)) el.setElementType(WhiteboardElementType.RECTANGLE);
                else if ("circle".equals(tool)) el.setElementType(WhiteboardElementType.CIRCLE);
                el.setStrokeWidth(el.getSize());
            } else if (el.getElementType() != null) {
                el.setTool(el.getElementType().name().toLowerCase());
                el.setSize(el.getStrokeWidth());
            }

            whiteboardElementRepository.save(el);
        }

        return getWhiteboard(meetingId);
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
