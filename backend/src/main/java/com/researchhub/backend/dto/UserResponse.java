package com.researchhub.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
public class UserResponse {
    private UUID id;
    private String email;
    private String fullName;
    private String affiliation;
    private String bio;
    private String website;
    private String avatarUrl;
    private boolean emailVerified;
    private String role;

    public UserResponse(UUID id, String email, String fullName) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
    }
}

