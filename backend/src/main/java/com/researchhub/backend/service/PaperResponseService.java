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
        // Ensure filePath is in the correct format for static access
        String filePath = paper.getFilePath();
        if (filePath != null && !filePath.startsWith("uploads/")) {
            filePath = "uploads/" + filePath;
        }
        
        // Handle categories safely - catch CME and return empty set if it occurs
        Set<Category> categories = new HashSet<>();
        try {
            if (paper.getCategories() != null) {
                categories.addAll(paper.getCategories());
            }
        } catch (Exception e) {
            // Silently catch CME and return empty categories
            categories = new HashSet<>();
        }
        
        return new PaperResponse(
                paper.getId(),
                paper.getTitle(),
                paper.getAuthor(),
                paper.getAbstractText(),
                paper.getUploadedAt(),
                paper.getPublicationYear(),
                filePath,
                categories
        );
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