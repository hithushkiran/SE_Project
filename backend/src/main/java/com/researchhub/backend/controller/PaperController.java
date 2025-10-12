package com.researchhub.backend.controller;

import com.researchhub.backend.dto.ApiResponse;
import com.researchhub.backend.dto.PaperCategoryRequest;
import com.researchhub.backend.dto.PaperResponse;
import com.researchhub.backend.model.Category;
import com.researchhub.backend.model.Paper;
import com.researchhub.backend.service.PaperResponseService;
import com.researchhub.backend.service.PaperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/papers")
public class PaperController {

    @Autowired
    private PaperService paperService;

    @Autowired
    private PaperResponseService paperResponseService;

    /**
     * EXISTING: Upload a paper (your original functionality)
     */
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<PaperResponse>> uploadPaper(
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "title", required = false) String title,
        @RequestParam(value = "author", required = false) String author,
        @RequestParam(value = "publicationYear", required = false) Integer publicationYear,
        @RequestParam(value = "abstractText", required = false) String abstractText,
        Authentication authentication) {

        try {
            UUID userId = getUserIdFromAuthentication(authentication);
            Paper savedPaper = paperService.uploadPaper(userId, file, title, author, publicationYear, abstractText);
            PaperResponse response = paperResponseService.toPaperResponse(savedPaper);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Paper uploaded successfully", response));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("File upload failed: " + e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid request: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Upload failed: " + e.getMessage()));
        }
    }

    /**
     * NEW: Upload paper with categories in one operation
     */
    @PostMapping("/upload-with-categories")
    public ResponseEntity<ApiResponse<PaperResponse>> uploadPaperWithCategories(
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "title", required = false) String title,
        @RequestParam(value = "author", required = false) String author,
        @RequestParam(value = "publicationYear", required = false) Integer publicationYear,
        @RequestParam(value = "abstractText", required = false) String abstractText,
        @RequestParam(value = "categoryIds", required = false) List<UUID> categoryIds,
        Authentication authentication) {

        try {
            UUID userId = getUserIdFromAuthentication(authentication);
            Paper savedPaper = paperService.uploadPaperWithCategories(userId, file, title, author, publicationYear, abstractText, categoryIds);
            PaperResponse response = paperResponseService.toPaperResponse(savedPaper);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Paper uploaded with categories successfully", response));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("File upload failed: " + e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid request: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Upload failed: " + e.getMessage()));
        }
    }

    /**
     * EXISTING: Delete a paper (your original functionality)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePaper(
            @PathVariable("id") UUID id,
            Authentication authentication) {

        try {
            paperService.deletePaper(id);
            return ResponseEntity.ok(ApiResponse.success("Paper deleted successfully", null));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("File deletion failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Paper not found: " + e.getMessage()));
        }
    }

    /**
     * EXISTING: Get paper by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaperResponse>> getPaperById(@PathVariable("id") UUID id) {
        try {
            Paper paper = paperService.getPaperById(id);
            PaperResponse response = paperResponseService.toPaperResponse(paper);
            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Paper not found: " + e.getMessage()));
        }
    }

    /**
     * EXISTING: Get all papers
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PaperResponse>>> getAllPapers() {
        try {
            List<Paper> papers = paperService.getAllPapers();
            List<PaperResponse> responses = paperResponseService.toPaperResponse(papers);
            return ResponseEntity.ok(ApiResponse.success(responses));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch papers: " + e.getMessage()));
        }
    }

    /**
     * NEW: Assign categories to an existing paper
     */
    @PutMapping("/{paperId}/categories")
    public ResponseEntity<ApiResponse<PaperResponse>> assignCategoriesToPaper(
            @PathVariable UUID paperId,
            @RequestBody PaperCategoryRequest request,
            Authentication authentication) {

        try {
            Paper paper = paperService.assignCategoriesToPaper(paperId, request.getCategoryIds());
            PaperResponse response = paperResponseService.toPaperResponse(paper);

            return ResponseEntity.ok(ApiResponse.success("Categories assigned successfully", response));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid request: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to assign categories: " + e.getMessage()));
        }
    }

    /**
     * NEW: Get categories for a specific paper
     */
    @GetMapping("/{paperId}/categories")
    public ResponseEntity<ApiResponse<Set<Category>>> getPaperCategories(
            @PathVariable UUID paperId) {

        try {
            Set<Category> categories = paperService.getPaperCategories(paperId);
            return ResponseEntity.ok(ApiResponse.success(categories));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Paper not found: " + e.getMessage()));
        }
    }

    /**
     * NEW: Get recent papers (for explore system)
     */
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<PaperResponse>>> getRecentPapers(
            @RequestParam(defaultValue = "10") int limit) {

        try {
            List<Paper> papers = paperService.getRecentPapers(limit);
            List<PaperResponse> responses = paperResponseService.toPaperResponse(papers);
            return ResponseEntity.ok(ApiResponse.success(responses));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch recent papers: " + e.getMessage()));
        }
    }

    /**
     * NEW: Search papers by keyword (basic search)
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PaperResponse>>> searchPapers(
            @RequestParam String query) {

        try {
            List<Paper> papers = paperService.searchPapers(query);
            List<PaperResponse> responses = paperResponseService.toPaperResponse(papers);
            return ResponseEntity.ok(ApiResponse.success(responses));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Search failed: " + e.getMessage()));
        }
    }

    /**
     * NEW: Get authenticated user's uploaded papers
     */
    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<Page<PaperResponse>>> getMyPublications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        try {
            UUID userId = getUserIdFromAuthentication(authentication);
            Pageable pageable = PageRequest.of(page, size);
            Page<Paper> papers = paperService.getUserPapers(userId, pageable);
            Page<PaperResponse> responses = paperResponseService.toPaperResponse(papers, userId);
            
            return ResponseEntity.ok(ApiResponse.success(responses));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch publications: " + e.getMessage()));
        }
    }

    /**
     * Helper method to get user ID from authentication
     */
    private UUID getUserIdFromAuthentication(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        return UUID.fromString(authentication.getName());
    }
}