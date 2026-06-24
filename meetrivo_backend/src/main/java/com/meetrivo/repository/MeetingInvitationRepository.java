package com.meetrivo.repository;

import com.meetrivo.model.InvitationStatus;
import com.meetrivo.model.MeetingInvitation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeetingInvitationRepository extends MongoRepository<MeetingInvitation, String> {

    List<MeetingInvitation> findByMeetingId(String meetingId);

    List<MeetingInvitation> findByReceiverEmail(String email);

    List<MeetingInvitation> findByReceiverUserId(String userId);

    List<MeetingInvitation> findByReceiverUserIdAndStatus(String userId, InvitationStatus status);

    List<MeetingInvitation> findByMeetingIdAndReceiverEmail(String meetingId, String email);

    List<MeetingInvitation> findByMeetingIdAndStatus(String meetingId, InvitationStatus status);
}
