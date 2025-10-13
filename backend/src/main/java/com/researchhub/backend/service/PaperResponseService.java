package com.researchhub.backend.service;

import com.researchhub.backend.dto.PaperResponse;
import com.researchhub.backend.model.Category;
import com.researchhub.backend.model.Paper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PaperResponseService {

    @Transactional(readOnly = true)
    public PaperResponse toPaperResponse(Paper paper) {
        System.out.println("=== toPaperResponse ===");
        System.out.println("Paper ID: " + paper.getId());
        System.out.println("Paper title: " + paper.getTitle());
        
        // Ensure filePath is in the correct format for static access
        String filePath = paper.getFilePath();
        if (filePath != null && !filePath.startsWith("uploads/")) {
            filePath = "uploads/" + filePath;
        }
        
        // Safely access categories with defensive copy to avoid ConcurrentModificationException
        Set<Category> categories = new HashSet<>();
        try {
            if (paper.getCategories() != null) {
                // Create defensive copy immediately without checking size first
                categories = new HashSet<>(paper.getCategories());
                System.out.println("Categories copied successfully: " + categories.size());
                if (!categories.isEmpty()) {
                    categories.forEach(cat -> System.out.println("  - Category: " + cat.getName() + " (ID: " + cat.getId() + ")"));
                }
            } else {
                System.out.println("paper.getCategories() is null");
            }
        } catch (Exception e) {
            // If lazy loading fails, just use empty set
            System.out.println("Exception while accessing categories: " + e.getMessage());
            e.printStackTrace();
            categories = new HashSet<>();
        }
        
        PaperResponse response = new PaperResponse(
                paper.getId(),
                paper.getTitle(),
                paper.getAuthor(),
                paper.getAbstractText(),
                paper.getUploadedAt(),
                paper.getPublicationYear(),
                filePath,
                categories
        );
        
        System.out.println("PaperResponse created with " + response.getCategories().size() + " categories");
        return response;
    }

    @Transactional(readOnly = true)
    public Page<PaperResponse> toPaperResponse(Page<Paper> papers) {
        List<PaperResponse> responseList = papers.getContent().stream()
                .map(this::toPaperResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(responseList, papers.getPageable(), papers.getTotalElements());
    }

    @Transactional(readOnly = true)
    public List<PaperResponse> toPaperResponse(List<Paper> papers) {
        return papers.stream()
                .map(this::toPaperResponse)
                .collect(Collectors.toList());
    }
}