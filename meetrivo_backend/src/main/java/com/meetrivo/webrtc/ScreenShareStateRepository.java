package com.meetrivo.webrtc;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScreenShareStateRepository extends MongoRepository<ScreenShareState, String> {
    Optional<ScreenShareState> findByMeetingIdAndUserId(String meetingId, String userId);
    List<ScreenShareState> findByMeetingId(String meetingId);
    void deleteByMeetingIdAndUserId(String meetingId, String userId);
}
