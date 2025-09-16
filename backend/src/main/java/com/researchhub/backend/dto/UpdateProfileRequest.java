
package com.researchhub.backend.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String affiliation;
    private String bio;
    private String website;
    private String avatarUrl;
}

