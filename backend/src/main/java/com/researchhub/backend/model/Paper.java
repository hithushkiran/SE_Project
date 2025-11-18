package com.researchhub.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
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

    @Column(name = "publication_year")
    private Integer publicationYear;

    @Column(name = "abstract_text", columnDefinition = "TEXT")
    private String abstractText;

    // Users that saved this paper in their libraries
    @ManyToMany(mappedBy = "library")
    @JsonIgnore
    private Set<User> savedByUsers = new HashSet<>();


    // Categories associated with this paper
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "paper_categories",
            joinColumns = @JoinColumn(name = "paper_id", columnDefinition = "BINARY(16)"),
            inverseJoinColumns = @JoinColumn(name = "category_id", columnDefinition = "BINARY(16)")
    )
    private Set<Category> categories = new HashSet<>();

    // Comments on this paper
    @OneToMany(mappedBy = "paper", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Comment> comments = new ArrayList<>();


    @PrePersist
    protected void onCreate() {
        this.id = UUID.randomUUID();
        this.uploadedAt = LocalDateTime.now();
    }
}
