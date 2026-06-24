package com.meetrivo.repository;

import com.meetrivo.model.UserSubscription;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserSubscriptionRepository extends MongoRepository<UserSubscription, String> {
    Optional<UserSubscription> findByUserId(String userId);
}
