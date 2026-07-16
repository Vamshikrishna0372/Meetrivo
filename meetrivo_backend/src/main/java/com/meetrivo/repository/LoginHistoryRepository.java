package com.meetrivo.repository;

import com.meetrivo.model.LoginHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoginHistoryRepository extends MongoRepository<LoginHistory, String> {
    List<LoginHistory> findByUserId(String userId);
    long countByUserId(String userId);
}
