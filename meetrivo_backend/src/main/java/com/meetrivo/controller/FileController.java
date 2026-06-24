package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.storage.StorageService;
import com.meetrivo.config.StorageConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "File Management", description = "Endpoints for uploading assets, logos, and downloading securely")
public class FileController {

    private final StorageService storageService;
    private final StorageConfig storageConfig;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload File Asset", description = "Uploads a profile picture, organization logo, whiteboard asset, or meeting attachment.")
    public ApiResponse<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", defaultValue = "general") String type) {
        
        try {
            String storagePath = storageService.store(file.getInputStream(), file.getOriginalFilename(), file.getContentType());
            
            Map<String, String> response = new HashMap<>();
            response.put("fileName", file.getOriginalFilename());
            response.put("contentType", file.getContentType());
            response.put("type", type);
            response.put("storagePath", storagePath);
            
            // Resolve filename to use as id
            Path pathObj = Paths.get(storagePath);
            String id = pathObj.getFileName().toString();
            response.put("id", id);
            
            // Download link to retrieve it securely
            response.put("url", "/api/files/download/" + id);

            return ApiResponse.success(response, "File uploaded successfully");
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    @GetMapping
    @Operation(summary = "List Files", description = "Retrieves all files uploaded in the storage directory.")
    public ApiResponse<List<Map<String, Object>>> listFiles() {
        List<Map<String, Object>> result = new ArrayList<>();
        try {
            Path rootDir = Paths.get(storageConfig.getLocalPath());
            if (Files.exists(rootDir) && Files.isDirectory(rootDir)) {
                File[] files = rootDir.toFile().listFiles();
                if (files != null) {
                    for (File f : files) {
                        if (f.isFile()) {
                            Map<String, Object> item = new HashMap<>();
                            String filename = f.getName();
                            item.put("id", filename);
                            
                            // strip uuid prefix for clean display name
                            String originalName = filename;
                            if (filename.contains("_")) {
                                originalName = filename.substring(filename.indexOf("_") + 1);
                            }
                            item.put("filename", filename);
                            item.put("originalName", originalName);
                            item.put("fileSize", f.length());
                            item.put("uploaderName", "Workspace User");
                            item.put("createdAt", Instant.ofEpochMilli(f.lastModified()).toString());
                            result.add(item);
                        }
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to list files", e);
        }
        return ApiResponse.success(result, "File list retrieved successfully");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete File", description = "Deletes an uploaded file by its ID (filename).")
    public ApiResponse<String> deleteFile(@PathVariable String id) {
        try {
            Path rootDir = Paths.get(storageConfig.getLocalPath());
            Path targetFile = rootDir.resolve(id);
            if (Files.exists(targetFile)) {
                storageService.delete(targetFile.toAbsolutePath().toString());
                return ApiResponse.success("File deleted successfully", "File deleted successfully");
            } else {
                throw new RuntimeException("File not found with ID: " + id);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete file", e);
        }
    }

    @GetMapping("/download")
    @Operation(summary = "Secure File Download", description = "Downloads a file securely from storage, checking authentication.")
    public ResponseEntity<Resource> downloadFile(@RequestParam("path") String storagePath) {
        if (!storageService.exists(storagePath)) {
            throw new RuntimeException("File not found at path: " + storagePath);
        }

        byte[] data = storageService.retrieve(storagePath);
        ByteArrayResource resource = new ByteArrayResource(data);
        
        String fileName = "downloaded_file";
        try {
            Path pathObj = storageService.resolveLocalPath(storagePath);
            fileName = pathObj.getFileName().toString();
            // strip uuid prefix if present
            if (fileName.contains("_")) {
                fileName = fileName.substring(fileName.indexOf("_") + 1);
            }
        } catch (Exception ignored) {}

        String contentType = "application/octet-stream";
        try {
            Path pathObj = storageService.resolveLocalPath(storagePath);
            contentType = Files.probeContentType(pathObj);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
        } catch (Exception ignored) {}

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .contentLength(data.length)
                .body(resource);
    }

    @GetMapping("/download/{id}")
    @Operation(summary = "Secure File Download by ID", description = "Downloads a file securely from storage by its ID (filename).")
    public ResponseEntity<Resource> downloadFileById(@PathVariable String id) {
        Path rootDir = Paths.get(storageConfig.getLocalPath());
        Path targetFile = rootDir.resolve(id);
        String storagePath = targetFile.toAbsolutePath().toString();
        
        if (!storageService.exists(storagePath)) {
            throw new RuntimeException("File not found with ID: " + id);
        }

        byte[] data = storageService.retrieve(storagePath);
        ByteArrayResource resource = new ByteArrayResource(data);
        
        String fileName = id;
        if (id.contains("_")) {
            fileName = id.substring(id.indexOf("_") + 1);
        }

        String contentType = "application/octet-stream";
        try {
            contentType = Files.probeContentType(targetFile);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
        } catch (Exception ignored) {}

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .contentLength(data.length)
                .body(resource);
    }
}
