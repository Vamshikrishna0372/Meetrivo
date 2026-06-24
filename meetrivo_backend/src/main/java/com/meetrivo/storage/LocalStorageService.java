package com.meetrivo.storage;

import com.meetrivo.config.StorageConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.UUID;

/**
 * Local filesystem implementation of {@link StorageService}.
 * Drop-in replacement: swap this bean for an S3StorageService / GCSStorageService
 * without changing any service or controller code.
 */
@Service
@RequiredArgsConstructor
public class LocalStorageService implements StorageService {

    private final StorageConfig storageConfig;

    @Override
    public String store(InputStream inputStream, String fileName, String contentType) {
        try {
            Path rootDir = Paths.get(storageConfig.getLocalPath());
            Files.createDirectories(rootDir);

            String uniqueName = UUID.randomUUID() + "_" + fileName;
            Path destination = rootDir.resolve(uniqueName);
            Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
            return destination.toAbsolutePath().toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + fileName, e);
        }
    }

    @Override
    public byte[] retrieve(String storagePath) {
        try {
            return Files.readAllBytes(Paths.get(storagePath));
        } catch (IOException e) {
            throw new RuntimeException("Failed to retrieve file: " + storagePath, e);
        }
    }

    @Override
    public Path resolveLocalPath(String storagePath) {
        return Paths.get(storagePath);
    }

    @Override
    public void delete(String storagePath) {
        try {
            Files.deleteIfExists(Paths.get(storagePath));
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file: " + storagePath, e);
        }
    }

    @Override
    public boolean exists(String storagePath) {
        return Files.exists(Paths.get(storagePath));
    }

    @Override
    public long size(String storagePath) {
        try {
            return Files.size(Paths.get(storagePath));
        } catch (IOException e) {
            return -1L;
        }
    }
}
