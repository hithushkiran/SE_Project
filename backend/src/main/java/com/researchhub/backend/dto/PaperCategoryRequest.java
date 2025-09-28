package com.researchhub.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
public class PaperCategoryRequest {
    private List<UUID> categoryIds;
}