package com.meetrivo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@Configuration
@EnableMongoAuditing
public class MongoConfig {
    // Basic configuration for MongoDB Auditing for createdAt and updatedAt support
}
