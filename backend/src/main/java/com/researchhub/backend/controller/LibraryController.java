package com.researchhub.backend.controller;

import com.researchhub.backend.dto.ApiResponse;
import com.researchhub.backend.exception.ResourceNotFoundException;
import com.researchhub.backend.model.Paper;
import com.researchhub.backend.service.LibraryService;
import com.researchhub.backend.service.PaperResponseService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class LibraryController {

    private static final Logger logger = LoggerFactory.getLogger(LibraryController.class);

    @Autowired
    private LibraryService libraryService;

    @Autowired
    private PaperResponseService paperResponseService;

    @PostMapping("/library/add/{paperId}")
    public ResponseEntity<ApiResponse<Void>> addToLibrary(@RequestParam("userId") UUID userId,
                                                         @PathVariable("paperId") UUID paperId) {
        try {
            logger.info("Adding paper {} to library for user {}", paperId, userId);
            libraryService.addToLibrary(userId, paperId);
            return ResponseEntity.ok(ApiResponse.success("Paper added to library successfully", null));
        } catch (ResourceNotFoundException e) {
            logger.error("Resource not found when adding to library: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error adding paper to library: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to add paper to library"));
        }
    }

    @DeleteMapping("/library/remove/{paperId}")
    public ResponseEntity<ApiResponse<Void>> removeFromLibrary(@RequestParam("userId") UUID userId,
                                                              @PathVariable("paperId") UUID paperId) {
        try {
            logger.info("Removing paper {} from library for user {}", paperId, userId);
            libraryService.removeFromLibrary(userId, paperId);
            return ResponseEntity.ok(ApiResponse.success("Paper removed from library successfully", null));
        } catch (ResourceNotFoundException e) {
            logger.error("Resource not found when removing from library: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error removing paper from library: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to remove paper from library"));
        }
    }

    @GetMapping("/users/{id}/library")
    public ResponseEntity<ApiResponse<List<?>>> getUserLibrary(@PathVariable("id") String userId) {
        try {
            logger.info("Getting library for user: {}", userId);
            
            // Parse UUID from string
            UUID userIdUuid;
            try {
                userIdUuid = UUID.fromString(userId);
            } catch (IllegalArgumentException e) {
                logger.error("Invalid UUID format: {}", userId);
                return ResponseEntity.badRequest().body(ApiResponse.error("Invalid user ID format"));
            }
            
            List<Paper> papers = libraryService.getUserLibrary(userIdUuid);
            
            // Convert to PaperResponse for consistent API format
            List<?> responseData = papers.stream()
                    .map(paperResponseService::toPaperResponse)
                    .toList();
            
            logger.info("Found {} papers in library for user {}", responseData.size(), userId);
            return ResponseEntity.ok(ApiResponse.success(responseData));
            
        } catch (ResourceNotFoundException e) {
            logger.error("User not found: {}", userId);
            return ResponseEntity.badRequest().body(ApiResponse.error("User not found"));
        } catch (Exception e) {
            logger.error("Error getting user library: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to load library"));
        }
    }
}


