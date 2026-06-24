package com.meetrivo.controller;

import com.meetrivo.dto.ApiResponse;
import com.meetrivo.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Tag(name = "Search Management", description = "Endpoints for global platform-wide search")
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    @Operation(summary = "Global Search", description = "Searches across meetings, users, organizations, teams, departments, chats, recordings, and transcripts using a single keyword")
    public ApiResponse<Map<String, Object>> search(@RequestParam("q") String query) {
        return ApiResponse.success(searchService.globalSearch(query), "Global search completed successfully");
    }
}
