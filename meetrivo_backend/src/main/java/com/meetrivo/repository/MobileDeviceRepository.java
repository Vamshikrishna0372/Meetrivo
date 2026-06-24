package com.meetrivo.repository;

import com.meetrivo.model.MobileDevice;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MobileDeviceRepository extends MongoRepository<MobileDevice, String> {
    Optional<MobileDevice> findByUserIdAndDeviceToken(String userId, String deviceToken);
    List<MobileDevice> findByUserId(String userId);
    void deleteByUserIdAndDeviceToken(String userId, String deviceToken);
}
