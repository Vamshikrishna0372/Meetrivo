package com.meetrivo.repository;

import com.meetrivo.model.CursorPosition;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CursorPositionRepository extends MongoRepository<CursorPosition, String> {
    List<CursorPosition> findByMeetingId(String meetingId);
    Optional<CursorPosition> findByMeetingIdAndUserId(String meetingId, String userId);
    void deleteByMeetingId(String meetingId);
    void deleteByMeetingIdAndUserId(String meetingId, String userId);
}
