package com.researchhub.backend.controller;

import com.researchhub.backend.dto.ApiResponse;
import com.researchhub.backend.dto.PaperResponse;
import com.researchhub.backend.exception.ResourceNotFoundException;
import com.researchhub.backend.service.LibraryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

    @PostMapping("/library/add/{paperId}")
    public ResponseEntity<ApiResponse<Void>> addToLibrary(
            @RequestParam(value = "userId", required = false) UUID userId,
            @PathVariable("paperId") UUID paperId,
            org.springframework.security.core.Authentication authentication) {
        try {
            UUID resolvedUserId = resolveUserId(userId, authentication);
            if (resolvedUserId == null) {
                logger.warn("Attempt to add paper {} to library without authenticated user context", paperId);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }

            logger.info("Adding paper {} to library for user {}", paperId, resolvedUserId);
            boolean added = libraryService.addToLibrary(resolvedUserId, paperId);
            if (added) {
                logger.info("Library add created entry for user {} paper {}", resolvedUserId, paperId);
                return ResponseEntity.status(HttpStatus.CREATED)
                        .body(ApiResponse.success("Paper added to library successfully", null));
            }
            logger.debug("Paper {} already present in library for user {}", paperId, resolvedUserId);
            logger.info("Library add skipped existing entry for user {} paper {}", resolvedUserId, paperId);
            return ResponseEntity.ok(ApiResponse.success("Paper already in library", null));
        } catch (ResourceNotFoundException e) {
            logger.error("Resource not found when adding to library: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error adding paper to library: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to add paper to library"));
        }
    }

    @DeleteMapping("/library/remove/{paperId}")
    public ResponseEntity<ApiResponse<Void>> removeFromLibrary(
            @RequestParam(value = "userId", required = false) UUID userId,
            @PathVariable("paperId") UUID paperId,
            org.springframework.security.core.Authentication authentication) {
        try {
            UUID resolvedUserId = resolveUserId(userId, authentication);
            if (resolvedUserId == null) {
                logger.warn("Attempt to remove paper {} from library without authenticated user context", paperId);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }

            logger.info("Removing paper {} from library for user {}", paperId, resolvedUserId);
            libraryService.removeFromLibrary(resolvedUserId, paperId);
            logger.info("Library remove completed for user {} paper {}", resolvedUserId, paperId);
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
    public ResponseEntity<ApiResponse<List<PaperResponse>>> getUserLibrary(@PathVariable("id") String userId) {
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
            
            List<PaperResponse> papers = libraryService.getUserLibrary(userIdUuid);
            logger.info("Found {} papers in library for user {}", papers.size(), userId);
            return ResponseEntity.ok(ApiResponse.success(papers));
            
        } catch (ResourceNotFoundException e) {
            logger.error("User not found: {}", userId);
            return ResponseEntity.badRequest().body(ApiResponse.error("User not found"));
        } catch (Exception e) {
            logger.error("Error getting user library: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to load library"));
        }
    }

    private UUID resolveUserId(UUID requestedUserId, org.springframework.security.core.Authentication authentication) {
        if (requestedUserId != null) {
            if (authentication != null && authentication.isAuthenticated()) {
                try {
                    UUID authenticatedId = UUID.fromString(authentication.getName());
                    if (!requestedUserId.equals(authenticatedId)) {
                        logger.warn("User ID in request ({}) does not match authenticated user ({})", requestedUserId, authenticatedId);
                        return null;
                    }
                } catch (IllegalArgumentException ex) {
                    logger.warn("Authentication principal [{}] is not a valid UUID", authentication.getName());
                    return null;
                }
            }
            return requestedUserId;
        }
        if (authentication != null && authentication.isAuthenticated()) {
            try {
                return UUID.fromString(authentication.getName());
            } catch (IllegalArgumentException ex) {
                logger.warn("Authentication principal [{}] is not a valid UUID", authentication.getName());
            }
        }
        return null;
    }
}


