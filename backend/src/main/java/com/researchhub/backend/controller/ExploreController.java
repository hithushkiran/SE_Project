package com.researchhub.backend.controller;

import com.researchhub.backend.dto.ApiResponse;
import com.researchhub.backend.dto.PaperResponse;
import com.researchhub.backend.dto.PaperSearchRequest;
import com.researchhub.backend.model.Paper;
import com.researchhub.backend.service.PaperSearchService; // Direct service
import com.researchhub.backend.service.PaperResponseService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/explore")
public class ExploreController {

    private static final Logger logger = LoggerFactory.getLogger(ExploreController.class);

    @Autowired
    private PaperSearchService paperSearchService; // Direct service injection

    @Autowired
    private PaperResponseService paperResponseService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PaperResponse>>> getExplorePage(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) List<UUID> categories,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String author,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {

        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("uploadedAt").descending());
            UUID userId = getUserIdFromAuthentication(authentication);

            PaperSearchRequest searchRequest = new PaperSearchRequest();
            searchRequest.setQuery(query);
            searchRequest.setCategoryIds(categories);
            searchRequest.setYear(year);
            searchRequest.setAuthor(author);

            Page<Paper> papers;
            if (searchRequest.hasFilters()) {
                papers = paperSearchService.searchPapers(searchRequest, pageable);
            } else {
                // For public access, get all papers instead of recommendations
                papers = paperSearchService.getAllPapers(pageable);
            }

            Page<PaperResponse> response = paperResponseService.toPaperResponse(papers);
            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            logger.error("Error in explore endpoint", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch papers: " + e.getMessage()));
        }
    }

    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<Page<PaperResponse>>> getTrendingPapers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "viewCount"));
            Page<Paper> papers = paperSearchService.getTrendingPapers(pageable);
            Page<PaperResponse> response = paperResponseService.toPaperResponse(papers);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            logger.error("Error fetching trending papers", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch trending papers: " + e.getMessage()));
        }
    }

    private UUID getUserIdFromAuthentication(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null; // Return null for public access
        }
        return UUID.fromString(authentication.getName());
    }
}
