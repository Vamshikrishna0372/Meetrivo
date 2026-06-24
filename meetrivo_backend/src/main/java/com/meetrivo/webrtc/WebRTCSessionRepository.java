package com.meetrivo.webrtc;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WebRTCSessionRepository extends MongoRepository<WebRTCSession, String> {
    Optional<WebRTCSession> findByMeetingIdAndUserId(String meetingId, String userId);
    List<WebRTCSession> findByMeetingId(String meetingId);
    void deleteByMeetingIdAndUserId(String meetingId, String userId);
    List<WebRTCSession> findByLastActivityAtBefore(LocalDateTime cutoff);
}
