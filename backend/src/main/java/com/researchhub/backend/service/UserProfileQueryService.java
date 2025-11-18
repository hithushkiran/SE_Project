package com.researchhub.backend.service;

import com.researchhub.backend.dto.CategoryResponse;
import com.researchhub.backend.dto.PaperResponse;
import com.researchhub.backend.dto.UserProfileResponse;
import com.researchhub.backend.exception.ResourceNotFoundException;
import com.researchhub.backend.model.Category;
import com.researchhub.backend.model.Paper;
import com.researchhub.backend.model.Profile;
import com.researchhub.backend.model.User;
import com.researchhub.backend.repository.PaperRepository;
import com.researchhub.backend.repository.ProfileRepository;
import com.researchhub.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserProfileQueryService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PaperRepository paperRepository;
    private final PaperService paperService;
    private final PaperResponseService paperResponseService;

    public UserProfileQueryService(UserRepository userRepository,
                                   ProfileRepository profileRepository,
                                   PaperRepository paperRepository,
                                   PaperService paperService,
                                   PaperResponseService paperResponseService) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.paperRepository = paperRepository;
        this.paperService = paperService;
        this.paperResponseService = paperResponseService;
    }

    public UserProfileResponse getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Profile profile = profileRepository.findByUserIdWithInterests(userId)
                .orElse(null);

        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setFullName(profile != null ? profile.getFullName() : null);
        response.setAffiliation(profile != null ? profile.getAffiliation() : null);
        response.setBio(profile != null ? profile.getBio() : null);
        response.setWebsite(profile != null ? profile.getWebsite() : null);
        response.setAvatarUrl(profile != null ? profile.getAvatarUrl() : null);
        response.setMaskedEmail(maskEmail(user.getEmail()));
        response.setTotalPapers(paperRepository.countByUploadedBy_Id(userId));
        response.setTotalViews(0L); // Views not tracked yet
        response.setInterests(mapCategories(profile != null ? profile.getInterests() : null));

        return response;
    }

    public Page<PaperResponse> getUserPapers(UUID userId, Pageable pageable, UUID currentUserId) {
        ensureUserExists(userId);
        Page<Paper> papers = paperService.getUserPapers(userId, pageable);
        return paperResponseService.toPaperResponse(papers, currentUserId);
    }

    private void ensureUserExists(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
    }

    private List<CategoryResponse> mapCategories(Set<Category> categories) {
        if (categories == null || categories.isEmpty()) {
            return List.of();
        }

        return categories.stream()
                .map(cat -> new CategoryResponse(cat.getId(), cat.getName(), cat.getDescription()))
                .collect(Collectors.toList());
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return null;
        }

        String[] parts = email.split("@", 2);
        if (parts.length != 2 || parts[0].isEmpty()) {
            return email;
        }

        String local = parts[0];
        String domain = parts[1];

        if (local.length() <= 2) {
            return local.charAt(0) + "*@" + domain;
        }

        return local.charAt(0) + "***" + local.charAt(local.length() - 1) + "@" + domain;
    }
}
