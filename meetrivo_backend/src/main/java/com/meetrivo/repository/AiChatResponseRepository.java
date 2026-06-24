package com.meetrivo.repository;

import com.meetrivo.model.AiChatResponse;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiChatResponseRepository extends MongoRepository<AiChatResponse, String> {

    List<AiChatResponse> findByMeetingIdOrderByCreatedAtDesc(String meetingId);

    List<AiChatResponse> findByRequestedByUserIdOrderByCreatedAtDesc(String userId);

    long countByMeetingId(String meetingId);
}
