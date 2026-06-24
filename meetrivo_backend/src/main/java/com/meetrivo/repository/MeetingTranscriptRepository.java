package com.meetrivo.repository;

import com.meetrivo.model.MeetingTranscript;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingTranscriptRepository extends MongoRepository<MeetingTranscript, String> {

    List<MeetingTranscript> findByMeetingIdOrderByTimestampAsc(String meetingId);

    List<MeetingTranscript> findByMeetingIdAndSpeakerIdOrderByTimestampAsc(String meetingId, String speakerId);

    List<MeetingTranscript> findByMeetingIdAndTextContainingIgnoreCaseOrderByTimestampAsc(String meetingId, String keyword);

    long countByMeetingId(String meetingId);

    void deleteByMeetingId(String meetingId);
}
