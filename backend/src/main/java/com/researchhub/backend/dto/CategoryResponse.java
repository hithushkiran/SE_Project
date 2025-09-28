package com.researchhub.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
public class CategoryResponse {
    private UUID id;
    private String name;
    private String description;

    public CategoryResponse(UUID id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }
}
