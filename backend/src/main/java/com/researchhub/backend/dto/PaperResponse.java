

package com.researchhub.backend.dto;

import com.researchhub.backend.model.Category;


import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import java.util.Set;

import java.util.UUID;

@Data
@NoArgsConstructor
public class PaperResponse {
    private UUID id;
    private String title;
    private String author;

    private String abstractSnippet;
    private LocalDateTime uploadedAt;
    private Integer publicationYear;
    private String filePath;
    private Set<Category> categories;
    private String abstractText;
    private String status;
    private String rejectionReason;
    private LocalDateTime reviewedAt;
    private UUID uploadedById;
    private String uploadedByName;
    private boolean canEdit;

    public PaperResponse(UUID id, String title, String author, String abstractText,
                         LocalDateTime uploadedAt, Integer publicationYear,
                         String filePath, Set<Category> categories,
                         UUID uploadedById, String uploadedByName, boolean canEdit) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.abstractSnippet = abstractText != null && abstractText.length() > 200
                ? abstractText.substring(0, 200) + "..."
                : abstractText;
        this.uploadedAt = uploadedAt;
        this.publicationYear = publicationYear;
        this.filePath = filePath;
        this.categories = categories;
        this.uploadedById = uploadedById;
        this.uploadedByName = uploadedByName;
        this.canEdit = canEdit;
    }
}

