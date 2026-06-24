package com.meetrivo.repository;

import com.meetrivo.model.AiMeetingSummary;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AiMeetingSummaryRepository extends MongoRepository<AiMeetingSummary, String> {

    Optional<AiMeetingSummary> findByMeetingId(String meetingId);

    List<AiMeetingSummary> findByHostIdOrderByGeneratedAtDesc(String hostId);

    List<AiMeetingSummary> findAllByOrderByGeneratedAtDesc();

    boolean existsByMeetingId(String meetingId);

    void deleteByMeetingId(String meetingId);
}
