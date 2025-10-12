package com.researchhub.backend.service;

import com.researchhub.backend.dto.PaperResponse;
import com.researchhub.backend.model.Paper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaperResponseService {

    public PaperResponse toPaperResponse(Paper paper) {
        // Ensure filePath is in the correct format for static access
        String filePath = paper.getFilePath();
        if (filePath != null && !filePath.startsWith("uploads/")) {
            filePath = "uploads/" + filePath;
        }
        
        return new PaperResponse(
                paper.getId(),
                paper.getTitle(),
                paper.getAuthor(),
                paper.getAbstractText(),
                paper.getUploadedAt(),
                paper.getPublicationYear(),
                filePath,
                paper.getViewCount(),
                paper.getCategories()
        );
    }

    public Page<PaperResponse> toPaperResponse(Page<Paper> papers) {
        List<PaperResponse> responseList = papers.getContent().stream()
                .map(this::toPaperResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(responseList, papers.getPageable(), papers.getTotalElements());
    }

    // ADD THIS METHOD for List<Paper> conversion
    public List<PaperResponse> toPaperResponse(List<Paper> papers) {
        return papers.stream()
                .map(this::toPaperResponse)
                .collect(Collectors.toList());
    }
}