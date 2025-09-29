package com.researchhub.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
public class CommentResponse {
    private UUID id;
    private String content;
    private UUID paperId;
    private UserResponse author;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean edited;
    
    public CommentResponse(UUID id, String content, UUID paperId, UserResponse author, 
                          LocalDateTime createdAt, LocalDateTime updatedAt, boolean edited) {
        this.id = id;
        this.content = content;
        this.paperId = paperId;
        this.author = author;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.edited = edited;
    }
}
