package com.researchhub.backend.service;

import com.researchhub.backend.model.Category;
import com.researchhub.backend.model.Profile;
import com.researchhub.backend.repository.CategoryRepository;
import com.researchhub.backend.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class UserProfileService {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Transactional
    public void updateUserInterests(UUID userId, List<UUID> categoryIds) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        if (categoryIds == null || categoryIds.isEmpty()) {
            profile.setInterests(new HashSet<>());
        } else {
            List<Category> categories = categoryRepository.findByIdIn(categoryIds);
            profile.setInterests(new HashSet<>(categories));
        }

        profileRepository.save(profile);
    }

    public Set<Category> getUserInterests(UUID userId) {
        Profile profile = profileRepository.findByUserIdWithInterests(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        return profile.getInterests() != null ? profile.getInterests() : new HashSet<>();
    }
}
