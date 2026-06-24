package com.meetrivo.repository;

import com.meetrivo.model.MeetingSummary;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MeetingSummaryRepository extends MongoRepository<MeetingSummary, String> {
    Optional<MeetingSummary> findByMeetingId(String meetingId);
    boolean existsByMeetingId(String meetingId);
    void deleteByMeetingId(String meetingId);
}
