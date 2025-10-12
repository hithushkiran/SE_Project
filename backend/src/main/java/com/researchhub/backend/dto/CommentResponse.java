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
    private UUID authorId;       // UUID of the User
    private String authorName;   // email or name of the User
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean edited;
    private String status;
    private String moderationReason;
    private LocalDateTime moderatedAt;

    public CommentResponse(UUID id, String content, UUID paperId, UUID authorId, String authorName,
                           LocalDateTime createdAt, LocalDateTime updatedAt, boolean edited,
                           String status, String moderationReason, LocalDateTime moderatedAt) {
        this.id = id;
        this.content = content;
        this.paperId = paperId;
        this.authorId = authorId;
        this.authorName = authorName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.edited = edited;
        this.status = status;
        this.moderationReason = moderationReason;
        this.moderatedAt = moderatedAt;
    }
}
