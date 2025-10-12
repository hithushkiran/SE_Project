package com.researchhub.backend.service;

import com.researchhub.backend.dto.PaperResponse;
import com.researchhub.backend.model.Paper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaperResponseService {

    public PaperResponse toPaperResponse(Paper paper) {
        return toPaperResponse(paper, null);
    }

    public PaperResponse toPaperResponse(Paper paper, UUID currentUserId) {
        // Ensure filePath is in the correct format for static access
        String filePath = paper.getFilePath();
        if (filePath != null && !filePath.startsWith("uploads/")) {
            filePath = "uploads/" + filePath;
        }

        UUID uploadedById = paper.getUploadedBy() != null ? paper.getUploadedBy().getId() : null;
        // For uploader name, we'll need to get it from Profile if available
        // For now, we'll use a simple approach
        String uploadedByName = paper.getUploadedBy() != null ? "Unknown User" : null;
        
        // Check if current user can edit this paper
        boolean canEdit = false;
        if (currentUserId != null && paper.getUploadedBy() != null) {
            canEdit = currentUserId.equals(paper.getUploadedBy().getId());
        }
        
        return new PaperResponse(
                paper.getId(),
                paper.getTitle(),
                paper.getAuthor(),
                paper.getAbstractText(),
                paper.getUploadedAt(),
                paper.getPublicationYear(),
                filePath,
                paper.getCategories(),
                uploadedById,
                uploadedByName,
                canEdit
        );
    }

    public Page<PaperResponse> toPaperResponse(Page<Paper> papers, UUID currentUserId) {
        List<PaperResponse> responseList = papers.getContent().stream()
                .map(paper -> toPaperResponse(paper, currentUserId))
                .collect(Collectors.toList());

        return new PageImpl<>(responseList, papers.getPageable(), papers.getTotalElements());
    }

    public List<PaperResponse> toPaperResponse(List<Paper> papers, UUID currentUserId) {
        return papers.stream()
                .map(paper -> toPaperResponse(paper, currentUserId))
                .collect(Collectors.toList());
    }

    // Keep backward compatibility methods without currentUserId
    public Page<PaperResponse> toPaperResponse(Page<Paper> papers) {
        return toPaperResponse(papers, null);
    }

    public List<PaperResponse> toPaperResponse(List<Paper> papers) {
        return toPaperResponse(papers, null);
    }
}