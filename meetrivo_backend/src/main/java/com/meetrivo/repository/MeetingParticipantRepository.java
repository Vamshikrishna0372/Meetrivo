package com.meetrivo.repository;

import com.meetrivo.model.MeetingParticipant;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeetingParticipantRepository extends MongoRepository<MeetingParticipant, String> {

    List<MeetingParticipant> findByMeetingId(String meetingId);

    List<MeetingParticipant> findByMeetingIdAndIsActiveTrue(String meetingId);

    Optional<MeetingParticipant> findByMeetingIdAndUserId(String meetingId, String userId);

    boolean existsByMeetingIdAndUserId(String meetingId, String userId);

    @org.springframework.data.mongodb.repository.Query("{'meetingId': ?0}")
    List<MeetingParticipant> findParticipantsByMeetingId(String meetingId);

    long countByMeetingIdAndIsActiveTrue(String meetingId);

    List<MeetingParticipant> findByUserId(String userId);

    long countByUserId(String userId);
}
