package com.meetrivo.storage;

import java.io.InputStream;
import java.nio.file.Path;

/**
 * Storage service abstraction.
 * Current implementation: Local filesystem.
 * Future-ready for: AWS S3, Google Cloud Storage, Azure Blob Storage.
 */
public interface StorageService {

    /**
     * Store a file from an InputStream.
     *
     * @param inputStream data source
     * @param fileName    target file name (unique)
     * @param contentType MIME type
     * @return storage path / URI of the saved file
     */
    String store(InputStream inputStream, String fileName, String contentType);

    /**
     * Retrieve a file as a byte array for streaming/download.
     *
     * @param storagePath path / URI returned by store()
     * @return file bytes
     */
    byte[] retrieve(String storagePath);

    /**
     * Resolve the absolute local path for a stored file.
     *
     * @param storagePath path / URI returned by store()
     * @return absolute {@link Path}
     */
    Path resolveLocalPath(String storagePath);

    /**
     * Delete a stored file.
     *
     * @param storagePath path / URI returned by store()
     */
    void delete(String storagePath);

    /**
     * Check whether a stored file exists.
     *
     * @param storagePath path / URI returned by store()
     * @return true if the file exists
     */
    boolean exists(String storagePath);

    /**
     * Return the size of a stored file in bytes, or -1 if not found.
     *
     * @param storagePath path / URI returned by store()
     * @return file size in bytes
     */
    long size(String storagePath);
}
