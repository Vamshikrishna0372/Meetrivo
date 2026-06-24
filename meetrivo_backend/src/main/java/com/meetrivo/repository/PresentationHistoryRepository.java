package com.meetrivo.repository;

import com.meetrivo.model.PresentationHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PresentationHistoryRepository extends MongoRepository<PresentationHistory, String> {
    List<PresentationHistory> findByMeetingId(String meetingId);
    Optional<PresentationHistory> findByMeetingIdAndActive(String meetingId, boolean active);
}
