package com.meetrivo.webrtc;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipantMediaStateRepository extends MongoRepository<ParticipantMediaState, String> {
    Optional<ParticipantMediaState> findByMeetingIdAndUserId(String meetingId, String userId);
    List<ParticipantMediaState> findByMeetingId(String meetingId);
    void deleteByMeetingIdAndUserId(String meetingId, String userId);
}
