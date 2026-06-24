package com.meetrivo.repository;

import com.meetrivo.model.WhiteboardElement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WhiteboardElementRepository extends MongoRepository<WhiteboardElement, String> {
    List<WhiteboardElement> findBySessionIdAndDeletedFalseOrderByCreatedAtAsc(String sessionId);
    List<WhiteboardElement> findByMeetingIdAndDeletedFalseOrderByCreatedAtAsc(String meetingId);
    void deleteBySessionId(String sessionId);
    void deleteByMeetingId(String meetingId);
}
