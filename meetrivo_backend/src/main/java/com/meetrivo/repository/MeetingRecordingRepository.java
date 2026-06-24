package com.meetrivo.repository;

import com.meetrivo.model.MeetingRecording;
import com.meetrivo.model.RecordingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeetingRecordingRepository extends MongoRepository<MeetingRecording, String> {

    Optional<MeetingRecording> findByRecordingId(String recordingId);

    Optional<MeetingRecording> findByShareToken(String shareToken);

    List<MeetingRecording> findByMeetingId(String meetingId);

    List<MeetingRecording> findByHostId(String hostId);

    List<MeetingRecording> findByMeetingIdAndStatus(String meetingId, RecordingStatus status);

    Optional<MeetingRecording> findByMeetingIdAndStatusIn(String meetingId, List<RecordingStatus> statuses);

    boolean existsByRecordingId(String recordingId);

    List<MeetingRecording> findByMeetingIdIn(List<String> meetingIds);
}
