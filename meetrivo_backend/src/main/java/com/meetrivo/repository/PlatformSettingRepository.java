package com.meetrivo.repository;

import com.meetrivo.model.PlatformSetting;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlatformSettingRepository extends MongoRepository<PlatformSetting, String> {
}
