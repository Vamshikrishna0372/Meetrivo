package com.meetrivo.repository;

import com.meetrivo.model.Meeting;
import com.meetrivo.model.MeetingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeetingRepository extends MongoRepository<Meeting, String> {

    Optional<Meeting> findByMeetingId(String meetingId);

    Optional<Meeting> findByMeetingCode(String meetingCode);

    List<Meeting> findByHostId(String hostId);

    List<Meeting> findByStatus(MeetingStatus status);

    List<Meeting> findByHostIdOrderByCreatedAtDesc(String hostId);

    @org.springframework.data.mongodb.repository.Query("{'status': 'ACTIVE'}")
    List<Meeting> findActiveMeetings();

    boolean existsByMeetingId(String meetingId);

    boolean existsByMeetingCode(String meetingCode);

    List<Meeting> findByOrganizationId(String organizationId);
}
