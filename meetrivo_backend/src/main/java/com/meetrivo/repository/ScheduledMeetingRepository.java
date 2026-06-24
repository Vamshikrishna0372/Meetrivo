package com.meetrivo.repository;

import com.meetrivo.model.ScheduledMeeting;
import com.meetrivo.model.ScheduledMeetingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduledMeetingRepository extends MongoRepository<ScheduledMeeting, String> {

    Optional<ScheduledMeeting> findByMeetingId(String meetingId);

    List<ScheduledMeeting> findByHostId(String hostId);

    List<ScheduledMeeting> findByHostIdAndStatus(String hostId, ScheduledMeetingStatus status);

    List<ScheduledMeeting> findByHostIdAndStartTimeAfterOrderByStartTimeAsc(String hostId, LocalDateTime time);

    List<ScheduledMeeting> findByHostIdAndStartTimeBeforeOrderByStartTimeDesc(String hostId, LocalDateTime time);

    List<ScheduledMeeting> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);

    List<ScheduledMeeting> findByStatus(ScheduledMeetingStatus status);
}
