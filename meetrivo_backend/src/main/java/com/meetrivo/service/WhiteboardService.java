package com.meetrivo.service;

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

    public List<WhiteboardElement> getWhiteboard(String meetingId) {
        logInfo("Retrieving whiteboard elements for meeting: " + meetingId);
        return whiteboardElementRepository.findByMeetingIdAndDeletedFalseOrderByCreatedAtAsc(meetingId);
    }

    public List<WhiteboardElement> saveWhiteboard(String meetingId, List<WhiteboardElement> elements) {
        User user = getCurrentUser();
        logInfo("Saving whiteboard elements for meeting: " + meetingId + " by user: " + user.getUsername());

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
            whiteboardElementRepository.save(el);
        }

        return whiteboardElementRepository.findByMeetingIdAndDeletedFalseOrderByCreatedAtAsc(meetingId);
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
