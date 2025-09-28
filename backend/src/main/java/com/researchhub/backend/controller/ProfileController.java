package com.researchhub.backend.controller;

import com.researchhub.backend.dto.ApiResponse;
import com.researchhub.backend.dto.UpdateInterestsRequest;
import com.researchhub.backend.model.Category;
import com.researchhub.backend.service.UserProfileService; // Direct service (renamed)
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserProfileService userProfileService; // Direct service injection (renamed)

    @PutMapping("/interests")
    public ResponseEntity<ApiResponse<Void>> updateInterests(
            @RequestBody UpdateInterestsRequest request,
            Authentication authentication) {
        try {
            UUID userId = getUserIdFromAuthentication(authentication);
            userProfileService.updateUserInterests(userId, request.getCategoryIds());
            return ResponseEntity.ok(ApiResponse.success("Interests updated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update interests: " + e.getMessage()));
        }
    }

    @GetMapping("/interests")
    public ResponseEntity<ApiResponse<Set<Category>>> getUserInterests(Authentication authentication) {
        try {
            UUID userId = getUserIdFromAuthentication(authentication);
            Set<Category> interests = userProfileService.getUserInterests(userId);
            return ResponseEntity.ok(ApiResponse.success(interests));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch interests: " + e.getMessage()));
        }
    }

    private UUID getUserIdFromAuthentication(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        return UUID.fromString(authentication.getName());
    }
}