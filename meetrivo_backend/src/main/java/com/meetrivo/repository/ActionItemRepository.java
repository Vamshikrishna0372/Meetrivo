package com.meetrivo.repository;

import com.meetrivo.model.ActionItem;
import com.meetrivo.model.ActionItemStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActionItemRepository extends MongoRepository<ActionItem, String> {
    List<ActionItem> findByMeetingIdOrderByCreatedAtDesc(String meetingId);
    List<ActionItem> findByMeetingIdAndStatusOrderByCreatedAtDesc(String meetingId, ActionItemStatus status);
    List<ActionItem> findByAssignedToOrderByDueDateAsc(String assignedTo);
    long countByMeetingId(String meetingId);
    void deleteByMeetingId(String meetingId);
}
