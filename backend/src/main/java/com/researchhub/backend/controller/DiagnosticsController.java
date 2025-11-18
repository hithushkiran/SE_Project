package com.researchhub.backend.controller;

import com.researchhub.backend.dto.ApiResponse;
import com.researchhub.backend.model.Paper;
import com.researchhub.backend.repository.PaperRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Diagnostic endpoint to verify paper-category associations
 * Helps identify papers without categories
 */
@RestController
@RequestMapping("/api/diagnostics")
@CrossOrigin(origins = "*")
public class DiagnosticsController {

    @Autowired
    private PaperRepository paperRepository;

    /**
     * Check all papers for missing categories
     */
    @GetMapping("/papers-without-categories")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkPapersWithoutCategories() {
        List<Paper> allPapers = paperRepository.findAll();
        
        List<Map<String, Object>> papersWithoutCategories = allPapers.stream()
                .filter(paper -> paper.getCategories() == null || paper.getCategories().isEmpty())
                .map(paper -> {
                    Map<String, Object> paperInfo = new HashMap<>();
                    paperInfo.put("id", paper.getId());
                    paperInfo.put("title", paper.getTitle());
                    paperInfo.put("author", paper.getAuthor());
                    paperInfo.put("uploadedAt", paper.getUploadedAt());
                    return paperInfo;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("totalPapers", allPapers.size());
        result.put("papersWithCategories", allPapers.size() - papersWithoutCategories.size());
        result.put("papersWithoutCategories", papersWithoutCategories.size());
        result.put("problematicPapers", papersWithoutCategories);

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * Check if a specific paper has categories
     */
    @GetMapping("/papers/{paperId}/verify")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyPaper(@PathVariable UUID paperId) {
        Optional<Paper> paperOpt = paperRepository.findByIdWithCategories(paperId);
        
        if (!paperOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Paper paper = paperOpt.get();
        Map<String, Object> result = new HashMap<>();
        result.put("paperId", paper.getId());
        result.put("title", paper.getTitle());
        result.put("hasCategories", paper.getCategories() != null && !paper.getCategories().isEmpty());
        result.put("categoryCount", paper.getCategories() != null ? paper.getCategories().size() : 0);
        result.put("categories", paper.getCategories());

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * Get system health status
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemHealth() {
        List<Paper> allPapers = paperRepository.findAll();
        
        long papersWithCategories = allPapers.stream()
                .filter(paper -> paper.getCategories() != null && !paper.getCategories().isEmpty())
                .count();
        
        long papersWithoutCategories = allPapers.size() - papersWithCategories;
        
        double healthPercentage = allPapers.isEmpty() ? 100.0 : 
                (papersWithCategories * 100.0) / allPapers.size();

        Map<String, Object> health = new HashMap<>();
        health.put("totalPapers", allPapers.size());
        health.put("papersWithCategories", papersWithCategories);
        health.put("papersWithoutCategories", papersWithoutCategories);
        health.put("healthPercentage", Math.round(healthPercentage * 100.0) / 100.0);
        health.put("status", papersWithoutCategories == 0 ? "HEALTHY" : "NEEDS_ATTENTION");

        return ResponseEntity.ok(ApiResponse.success(health));
    }
}
