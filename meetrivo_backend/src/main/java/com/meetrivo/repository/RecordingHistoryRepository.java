package com.meetrivo.repository;

import com.meetrivo.model.RecordingHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecordingHistoryRepository extends MongoRepository<RecordingHistory, String> {

    List<RecordingHistory> findByMeetingId(String meetingId);

    List<RecordingHistory> findByRecordingId(String recordingId);

    List<RecordingHistory> findByMeetingIdOrderByTimestampDesc(String meetingId);

    List<RecordingHistory> findByRecordingIdOrderByTimestampDesc(String recordingId);
}
