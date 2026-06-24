package com.meetrivo.repository;

import com.meetrivo.model.StickyNote;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StickyNoteRepository extends MongoRepository<StickyNote, String> {
    List<StickyNote> findByMeetingIdOrderByCreatedAtAsc(String meetingId);
    List<StickyNote> findByMeetingIdAndUserIdOrderByCreatedAtAsc(String meetingId, String userId);
    void deleteByMeetingId(String meetingId);
}
