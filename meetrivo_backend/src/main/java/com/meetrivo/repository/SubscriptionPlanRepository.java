package com.meetrivo.repository;

import com.meetrivo.model.SubscriptionPlan;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionPlanRepository extends MongoRepository<SubscriptionPlan, String> {
    List<SubscriptionPlan> findByActiveTrue();
}
