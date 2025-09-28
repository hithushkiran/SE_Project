package com.researchhub.backend.controller;

import com.researchhub.backend.dto.ApiResponse;
import com.researchhub.backend.model.Category;
import com.researchhub.backend.model.Paper;
import com.researchhub.backend.repository.CategoryRepository;
import com.researchhub.backend.repository.PaperRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private PaperRepository paperRepository;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTestStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long categoryCount = categoryRepository.count();
        long paperCount = paperRepository.count();
        
        stats.put("categories", categoryCount);
        stats.put("papers", paperCount);
        stats.put("status", "Database connection working");
        
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<Iterable<Category>>> getAllCategories() {
        Iterable<Category> categories = categoryRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/papers")
    public ResponseEntity<ApiResponse<List<Paper>>> getAllPapers() {
        List<Paper> papers = (List<Paper>) paperRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(papers));
    }
}
