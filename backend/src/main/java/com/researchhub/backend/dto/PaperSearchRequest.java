package com.researchhub.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
public class PaperSearchRequest {
    private String query;
    private List<UUID> categoryIds;
    private Integer year;
    private String author;
    private Integer page = 0;
    private Integer size = 20;

    public boolean hasFilters() {
        return query != null ||
                (categoryIds != null && !categoryIds.isEmpty()) ||
                year != null ||
                author != null;
    }
}
