package com.meetrivo.repository;

import com.meetrivo.model.BreakoutRoom;
import com.meetrivo.model.BreakoutRoomStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BreakoutRoomRepository extends MongoRepository<BreakoutRoom, String> {
    List<BreakoutRoom> findByMeetingIdOrderByCreatedAtAsc(String meetingId);
    List<BreakoutRoom> findByMeetingIdAndStatusOrderByCreatedAtAsc(String meetingId, BreakoutRoomStatus status);
    Optional<BreakoutRoom> findByIdAndMeetingId(String id, String meetingId);
    boolean existsByMeetingIdAndRoomName(String meetingId, String roomName);
    void deleteByMeetingId(String meetingId);
}
