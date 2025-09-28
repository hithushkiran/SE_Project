package com.researchhub.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
public class PaperResponse {
    private UUID id;
    private String title;
    private String author;
    private String filePath;
    private LocalDateTime uploadedAt;
    private int commentCount;
    
    public PaperResponse(UUID id, String title, String author, String filePath, 
                        LocalDateTime uploadedAt, int commentCount) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.filePath = filePath;
        this.uploadedAt = uploadedAt;
        this.commentCount = commentCount;
    }
}
