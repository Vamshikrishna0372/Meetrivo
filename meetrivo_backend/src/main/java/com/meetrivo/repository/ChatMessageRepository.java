package com.meetrivo.repository;

import com.meetrivo.model.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findByMeetingIdAndDeletedFalseOrderByTimestampAsc(String meetingId);
    List<ChatMessage> findByMeetingIdOrderByTimestampAsc(String meetingId);
    List<ChatMessage> findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByTimestampAsc(
            String senderId, String receiverId, String receiverId2, String senderId2);
    long countBySenderId(String senderId);
}
