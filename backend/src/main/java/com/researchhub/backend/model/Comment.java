package com.researchhub.backend.model;

import com.researchhub.backend.util.UuidBinaryConverter;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @Column(name = "id", columnDefinition = "BINARY(16)")
    @Convert(converter = UuidBinaryConverter.class)
    private UUID id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paper_id", nullable = false)
    private Paper paper;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "edited")
    private boolean edited = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CommentStatus status = CommentStatus.APPROVED;

    @Column(name = "moderation_reason", columnDefinition = "TEXT")
    private String moderationReason;

    @Column(name = "moderated_at")
    private LocalDateTime moderatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moderated_by")
    private User moderatedBy;

    @PrePersist
    protected void onCreate() {
        this.id = UUID.randomUUID();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        this.edited = true;
    }
}
