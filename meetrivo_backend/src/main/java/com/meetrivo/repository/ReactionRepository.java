package com.meetrivo.repository;

import com.meetrivo.model.Reaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReactionRepository extends MongoRepository<Reaction, String> {
    List<Reaction> findByMeetingIdOrderByTimestampDesc(String meetingId);
}
