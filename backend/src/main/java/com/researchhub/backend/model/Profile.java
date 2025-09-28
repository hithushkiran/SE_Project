 package com.researchhub.backend.model;

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
@Table(name = "profiles")
public class Profile {

    @Id
    @Column(name = "user_id", columnDefinition = "BINARY(16)")
    @Convert(converter = UuidBinaryConverter.class)
    private UUID userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private String fullName;
    private String affiliation;
    private String bio;
    private String website;
    private String avatarUrl;

    // User's research interests
    @ManyToMany
    @JoinTable(
            name = "user_interests",
            joinColumns = @JoinColumn(name = "user_id", columnDefinition = "BINARY(16)"),
            inverseJoinColumns = @JoinColumn(name = "category_id", columnDefinition = "BINARY(16)")
    )
    private Set<Category> interests = new HashSet<>();
}
