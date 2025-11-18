package com.researchhub.backend.service;

import com.researchhub.backend.dto.AuthorInfo;
import com.researchhub.backend.dto.PaperResponse;
import com.researchhub.backend.model.Category;
import com.researchhub.backend.model.Paper;
import com.researchhub.backend.model.Profile;
import com.researchhub.backend.model.User;
import com.researchhub.backend.repository.ProfileRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PaperResponseService {

    private final ProfileRepository profileRepository;

    public PaperResponseService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    // --- Public Conversion Methods (Handling Current User ID) ---

    @Transactional(readOnly = true)
    public PaperResponse toPaperResponse(Paper paper) {
        // Fallback for methods not requiring currentUserId
        return toPaperResponse(paper, null);
    }

    @Transactional(readOnly = true)
    public PaperResponse toPaperResponse(Paper paper, UUID currentUserId) {
        return buildResponse(paper, currentUserId, null);
    }

    @Transactional(readOnly = true)
    public Page<PaperResponse> toPaperResponse(Page<Paper> papers, UUID currentUserId) {
        Map<UUID, Profile> profileMap = preloadProfiles(papers.getContent());

        List<PaperResponse> responseList = papers.getContent().stream()
                .map(paper -> buildResponse(paper, currentUserId, profileMap))
                .collect(Collectors.toList());

        return new PageImpl<>(responseList, papers.getPageable(), papers.getTotalElements());
    }

    @Transactional(readOnly = true)
    public List<PaperResponse> toPaperResponse(List<Paper> papers, UUID currentUserId) {
        Map<UUID, Profile> profileMap = preloadProfiles(papers);

        return papers.stream()
                .map(paper -> buildResponse(paper, currentUserId, profileMap))
                .collect(Collectors.toList());
    }

    // --- Backward Compatibility Methods (Without Current User ID) ---

    @Transactional(readOnly = true)
    public Page<PaperResponse> toPaperResponse(Page<Paper> papers) {
        return toPaperResponse(papers, null);
    }

    @Transactional(readOnly = true)
    public List<PaperResponse> toPaperResponse(List<Paper> papers) {
        return toPaperResponse(papers, null);
    }

    // --- Private Helper Methods ---

    private PaperResponse buildResponse(Paper paper, UUID currentUserId, Map<UUID, Profile> profileMap) {
        String filePath = normalizeFilePath(paper.getFilePath());
        UUID uploadedById = paper.getUploadedBy() != null ? paper.getUploadedBy().getId() : null;

        boolean canEdit = currentUserId != null
                && paper.getUploadedBy() != null
                && currentUserId.equals(paper.getUploadedBy().getId());

        // Handle categories safely - catch ConcurrentModificationException (CME) and return empty set if it occurs
        Set<Category> categories = new HashSet<>();
        try {
            if (paper.getCategories() != null) {
                categories.addAll(paper.getCategories());
            }
        } catch (Exception e) {
            // Silently catch CME and return empty categories
            categories = new HashSet<>();
        }

        PaperResponse response = new PaperResponse(
                paper.getId(),
                paper.getTitle(),
                paper.getAuthor(),
                paper.getAbstractText(),
                paper.getUploadedAt(),
                paper.getPublicationYear(),
                filePath,
                categories, // Use the safe categories set
                uploadedById,
                null, // authorInfo is set below
                canEdit
        );

        AuthorInfo authorInfo = buildAuthorInfo(paper.getUploadedBy(), profileMap);
        if (authorInfo != null) {
            response.setAuthorInfo(authorInfo);
            // This is likely intended to set the name for display if authorInfo is available
            response.setUploadedByName(authorInfo.getName() != null
                    ? authorInfo.getName()
                    : authorInfo.getMaskedEmail());
        }

        return response;
    }

    private String normalizeFilePath(String filePath) {
        if (filePath == null) {
            return null;
        }

        // Check for existing 'uploads/' prefix, correcting it if necessary (e.g., stripping leading '/')
        if (filePath.startsWith("uploads/") || filePath.startsWith("/uploads/")) {
            return filePath.startsWith("/") ? filePath.substring(1) : filePath;
        }

        return "uploads/" + filePath;
    }

    private Map<UUID, Profile> preloadProfiles(Collection<Paper> papers) {
        Set<UUID> uploaderIds = papers.stream()
                .map(Paper::getUploadedBy)
                .filter(Objects::nonNull)
                .map(User::getId)
                .collect(Collectors.toSet());

        if (uploaderIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return profileRepository.findAllById(uploaderIds).stream()
                .collect(Collectors.toMap(Profile::getUserId, profile -> profile));
    }

    private AuthorInfo buildAuthorInfo(User uploader, Map<UUID, Profile> profileMap) {
        if (uploader == null) {
            return null;
        }

        UUID uploaderId = uploader.getId();
        Profile profile = null;
        if (profileMap != null && profileMap.containsKey(uploaderId)) {
            profile = profileMap.get(uploaderId);
        } else if (profileMap == null) {
            // Fetch individually if no map was preloaded (e.g., for a single paper)
            profile = profileRepository.findByUserId(uploaderId).orElse(null);
        }

        String displayName = (profile != null && profile.getFullName() != null && !profile.getFullName().isBlank())
                ? profile.getFullName()
                : deriveNameFromEmail(uploader.getEmail());

        String maskedEmail = maskEmail(uploader.getEmail());

        return new AuthorInfo(uploaderId, displayName, maskedEmail);
    }

    private String deriveNameFromEmail(String email) {
        if (email == null || !email.contains("@")) {
            return null;
        }
        // Returns the local part of the email (before the @)
        return email.substring(0, email.indexOf("@"));
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

        // Masking logic
        if (local.length() <= 2) {
            // e.g., "a@domain.com" -> "a*@domain.com"
            return local.charAt(0) + "*@" + domain;
        }

        // e.g., "name@domain.com" -> "n***e@domain.com"
        return local.charAt(0) + "***" + local.charAt(local.length() - 1) + "@" + domain;
    }
}