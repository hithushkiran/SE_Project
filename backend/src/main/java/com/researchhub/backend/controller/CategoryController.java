
package com.researchhub.backend.controller;

import com.researchhub.backend.dto.ApiResponse;
import com.researchhub.backend.dto.CategoryResponse;
import com.researchhub.backend.model.Category;
import com.researchhub.backend.service.CategoryService; // Direct service
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService; // Direct service injection

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        try {
            List<Category> categories = categoryService.getAllCategories();
            List<CategoryResponse> response = categories.stream()
                    .map(cat -> new CategoryResponse(cat.getId(), cat.getName(), cat.getDescription()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch categories: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable String id) {
        try {
            Category category = categoryService.getCategoryById(java.util.UUID.fromString(id));
            CategoryResponse response = new CategoryResponse(category.getId(), category.getName(), category.getDescription());
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Category not found: " + e.getMessage()));
        }
    }
}