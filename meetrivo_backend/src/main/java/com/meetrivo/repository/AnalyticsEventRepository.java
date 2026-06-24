package com.meetrivo.repository;

import com.meetrivo.model.AnalyticsEvent;
import com.meetrivo.model.AnalyticsEventType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnalyticsEventRepository extends MongoRepository<AnalyticsEvent, String> {
    List<AnalyticsEvent> findByEventType(AnalyticsEventType eventType);
    List<AnalyticsEvent> findByUserId(String userId);
    List<AnalyticsEvent> findByMeetingId(String meetingId);
    List<AnalyticsEvent> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
}
