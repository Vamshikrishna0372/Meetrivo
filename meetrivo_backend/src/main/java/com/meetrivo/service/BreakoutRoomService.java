package com.meetrivo.service;

import com.meetrivo.model.*;
import com.meetrivo.repository.BreakoutRoomRepository;
import com.meetrivo.repository.MeetingParticipantRepository;
import com.meetrivo.repository.MeetingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BreakoutRoomService extends BaseService {

    private final BreakoutRoomRepository breakoutRoomRepository;
    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository participantRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ─── Create Room ──────────────────────────────────────────────────────────

    public BreakoutRoom createRoom(String meetingId, String roomName) {
        validateHost(meetingId);

        if (breakoutRoomRepository.existsByMeetingIdAndRoomName(meetingId, roomName)) {
            throw new RuntimeException("A breakout room named '" + roomName + "' already exists in this meeting");
        }

        User host = getCurrentUser();
        BreakoutRoom room = BreakoutRoom.builder()
                .meetingId(meetingId)
                .roomName(roomName)
                .hostId(host.getId())
                .status(BreakoutRoomStatus.OPEN)
                .createdAt(LocalDateTime.now())
                .build();

        BreakoutRoom saved = breakoutRoomRepository.save(room);
        broadcastRoomUpdate(meetingId, "ROOM_CREATED", saved);
        logInfo("Breakout room created: " + roomName + " in meeting: " + meetingId);
        return saved;
    }

    // ─── Assign Participants ──────────────────────────────────────────────────

    public BreakoutRoom assignParticipants(String meetingId, String roomId, List<String> participantIds) {
        validateHost(meetingId);

        BreakoutRoom room = getRoom(roomId, meetingId);
        room.getParticipantIds().addAll(participantIds.stream()
                .filter(id -> !room.getParticipantIds().contains(id))
                .toList());

        BreakoutRoom saved = breakoutRoomRepository.save(room);
        broadcastRoomUpdate(meetingId, "PARTICIPANTS_ASSIGNED", saved);
        logInfo("Assigned " + participantIds.size() + " participants to room: " + roomId);
        return saved;
    }

    // ─── Move Participant ─────────────────────────────────────────────────────

    public BreakoutRoom moveParticipant(String meetingId, String fromRoomId, String toRoomId, String participantId) {
        validateHost(meetingId);

        // Remove from source
        BreakoutRoom fromRoom = getRoom(fromRoomId, meetingId);
        fromRoom.getParticipantIds().remove(participantId);
        breakoutRoomRepository.save(fromRoom);

        // Add to destination
        BreakoutRoom toRoom = getRoom(toRoomId, meetingId);
        if (!toRoom.getParticipantIds().contains(participantId)) {
            toRoom.getParticipantIds().add(participantId);
        }
        BreakoutRoom saved = breakoutRoomRepository.save(toRoom);

        broadcastRoomUpdate(meetingId, "PARTICIPANT_MOVED", Map.of(
                "participantId", participantId,
                "fromRoom", fromRoomId,
                "toRoom", toRoomId
        ));
        return saved;
    }

    // ─── Close Room ───────────────────────────────────────────────────────────

    public BreakoutRoom closeRoom(String meetingId, String roomId) {
        validateHost(meetingId);

        BreakoutRoom room = getRoom(roomId, meetingId);
        room.setStatus(BreakoutRoomStatus.CLOSED);
        room.setClosedAt(LocalDateTime.now());

        BreakoutRoom saved = breakoutRoomRepository.save(room);
        broadcastRoomUpdate(meetingId, "ROOM_CLOSED", saved);
        logInfo("Breakout room closed: " + roomId);
        return saved;
    }

    // ─── Get All Rooms ────────────────────────────────────────────────────────

    public List<BreakoutRoom> getRooms(String meetingId) {
        validateMembership(meetingId);
        return breakoutRoomRepository.findByMeetingIdOrderByCreatedAtAsc(meetingId);
    }

    // ─── Get Open Rooms ───────────────────────────────────────────────────────

    public List<BreakoutRoom> getOpenRooms(String meetingId) {
        validateMembership(meetingId);
        return breakoutRoomRepository.findByMeetingIdAndStatusOrderByCreatedAtAsc(meetingId, BreakoutRoomStatus.OPEN);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private BreakoutRoom getRoom(String roomId, String meetingId) {
        return breakoutRoomRepository.findByIdAndMeetingId(roomId, meetingId)
                .orElseThrow(() -> new RuntimeException("Breakout room not found: " + roomId));
    }

    private void broadcastRoomUpdate(String meetingId, String event, Object payload) {
        try {
            messagingTemplate.convertAndSend("/topic/breakout/" + meetingId,
                    (Object) Map.of("event", event, "data", payload));
        } catch (Exception e) {
            logError("Failed to broadcast breakout room update", e);
        }
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private void validateHost(String meetingId) {
        User user = getCurrentUser();
        meetingRepository.findByMeetingId(meetingId)
                .filter(m -> m.getHostId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Access denied: Only the host can manage breakout rooms"));
    }

    private void validateMembership(String meetingId) {
        User user = getCurrentUser();
        boolean isHost = meetingRepository.findByMeetingId(meetingId)
                .map(m -> m.getHostId().equals(user.getId())).orElse(false);
        boolean isMember = participantRepository.findByMeetingIdAndUserId(meetingId, user.getId()).isPresent();
        if (!isHost && !isMember) {
            throw new RuntimeException("Access denied: Not a member of this meeting");
        }
    }
}
