
package com.researchhub.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.researchhub.backend.util.UuidBinaryConverter;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "categories")
public class Category {

    @Id
    @Column(name = "id", columnDefinition = "BINARY(16)")
    @Convert(converter = UuidBinaryConverter.class)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 500)
    private String description;

    @ManyToMany(mappedBy = "categories")
    @JsonIgnore
    private Set<Paper> papers = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        this.id = UUID.randomUUID();
    }
}