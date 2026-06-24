package com.meetrivo.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Storage configuration.
 * Reads from application.properties / application.yml with prefix "meetrivo.storage".
 *
 * Example (application.properties):
 *   meetrivo.storage.provider=local
 *   meetrivo.storage.local-path=./recordings
 *   meetrivo.storage.max-file-size-mb=500
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "meetrivo.storage")
public class StorageConfig {

    /** Storage provider: local | s3 | gcs | azure */
    private String provider = "local";

    /** Root directory for local storage */
    private String localPath = "./recordings";

    /** Maximum allowed recording file size in MB */
    private int maxFileSizeMb = 500;

    /** AWS S3 bucket name (future) */
    private String s3BucketName;

    /** AWS region (future) */
    private String s3Region;

    /** Google Cloud Storage bucket name (future) */
    private String gcsBucketName;

    /** Azure Blob Storage container name (future) */
    private String azureContainerName;
}
