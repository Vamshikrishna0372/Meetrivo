package com.meetrivo.repository;

import com.meetrivo.model.WhiteboardSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WhiteboardSessionRepository extends MongoRepository<WhiteboardSession, String> {
    Optional<WhiteboardSession> findByMeetingId(String meetingId);
    boolean existsByMeetingId(String meetingId);
    void deleteByMeetingId(String meetingId);
}
