package com.meetrivo.repository;

import com.meetrivo.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Notification> findByUserIdAndReadOrderByCreatedAtDesc(String userId, boolean read);

    long countByUserIdAndReadFalse(String userId);

    boolean existsByUserIdAndTitleContainingAndReadFalse(String userId, String titleKeyword);
}
