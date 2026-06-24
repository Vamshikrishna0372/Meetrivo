package com.meetrivo.repository;

import com.meetrivo.model.ScreenShareSession;
import com.meetrivo.model.ShareStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScreenShareSessionRepository extends MongoRepository<ScreenShareSession, String> {
    List<ScreenShareSession> findByMeetingId(String meetingId);
    Optional<ScreenShareSession> findByMeetingIdAndStatus(String meetingId, ShareStatus status);
    Optional<ScreenShareSession> findByMeetingIdAndUserIdAndStatus(String meetingId, String userId, ShareStatus status);
}
