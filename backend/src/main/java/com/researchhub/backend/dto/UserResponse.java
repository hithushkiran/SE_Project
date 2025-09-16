package com.researchhub.backend.dto;

import lombok.Data;

import java.util.UUID;

@Data
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
}

