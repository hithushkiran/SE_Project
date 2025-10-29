package com.researchhub.backend.dto;

import com.researchhub.backend.model.Category;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class LibraryItemDTO {
    private final Long id;
    private final UUID paperId;
    private final String title;
    private final String author;
    private final Set<Category> categories;
    private final String abstractSnippet;
    private final LocalDateTime uploadedAt;
    private final Integer publicationYear;
    private final Long viewCount;
    private final String filePath;
    private final Instant createdAt;
}
