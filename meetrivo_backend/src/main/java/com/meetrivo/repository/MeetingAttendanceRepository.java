package com.meetrivo.repository;

import com.meetrivo.model.MeetingAttendance;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingAttendanceRepository extends MongoRepository<MeetingAttendance, String> {
    List<MeetingAttendance> findByMeetingId(String meetingId);
    List<MeetingAttendance> findByUserId(String userId);
    List<MeetingAttendance> findByMeetingIdAndUserId(String meetingId, String userId);
}
