package com.meetrivo.repository;

import com.meetrivo.model.SystemAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemAlertRepository extends MongoRepository<SystemAlert, String> {
    List<SystemAlert> findByResolvedFalseOrderByTimestampDesc();
}
