package com.researchhub.backend.model;

import com.researchhub.backend.util.UuidBinaryConverter;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "papers")
public class Paper {

    @Id
    @Column(name = "id", columnDefinition = "BINARY(16)")
    @Convert(converter = UuidBinaryConverter.class)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column
    private String author;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    // Users that saved this paper in their libraries
    @ManyToMany(mappedBy = "library")
    private Set<User> savedByUsers = new HashSet<>();

    // Comments on this paper
    @OneToMany(mappedBy = "paper", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Comment> comments = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.id = UUID.randomUUID();
        this.uploadedAt = LocalDateTime.now();
    }
}


