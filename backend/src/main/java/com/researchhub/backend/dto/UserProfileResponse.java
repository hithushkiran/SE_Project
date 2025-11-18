package com.researchhub.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
public class UserProfileResponse {
    private UUID id;
    private String fullName;
    private String affiliation;
    private String bio;
    private String website;
    private String avatarUrl;
    private String maskedEmail;
    private long totalPapers;
    private long totalViews;
    private List<CategoryResponse> interests = new ArrayList<>();
}
