package com.researchhub.backend.service;

import com.researchhub.backend.dto.AuthorInfo;
import com.researchhub.backend.dto.PaperResponse;
import com.researchhub.backend.model.Paper;
import com.researchhub.backend.model.Profile;
import com.researchhub.backend.model.User;
import com.researchhub.backend.repository.ProfileRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PaperResponseService {

    private final ProfileRepository profileRepository;

    public PaperResponseService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public PaperResponse toPaperResponse(Paper paper) {
        return toPaperResponse(paper, null);
    }

    public PaperResponse toPaperResponse(Paper paper, UUID currentUserId) {
        return buildResponse(paper, currentUserId, null);
    }

    public Page<PaperResponse> toPaperResponse(Page<Paper> papers, UUID currentUserId) {
        Map<UUID, Profile> profileMap = preloadProfiles(papers.getContent());

        List<PaperResponse> responseList = papers.getContent().stream()
                .map(paper -> buildResponse(paper, currentUserId, profileMap))
                .collect(Collectors.toList());

        return new PageImpl<>(responseList, papers.getPageable(), papers.getTotalElements());
    }

    public List<PaperResponse> toPaperResponse(List<Paper> papers, UUID currentUserId) {
        Map<UUID, Profile> profileMap = preloadProfiles(papers);

        return papers.stream()
                .map(paper -> buildResponse(paper, currentUserId, profileMap))
                .collect(Collectors.toList());
    }

    // Keep backward compatibility methods without currentUserId
    public Page<PaperResponse> toPaperResponse(Page<Paper> papers) {
        return toPaperResponse(papers, null);
    }

    public List<PaperResponse> toPaperResponse(List<Paper> papers) {
        return toPaperResponse(papers, null);
    }

    private PaperResponse buildResponse(Paper paper, UUID currentUserId, Map<UUID, Profile> profileMap) {
        String filePath = normalizeFilePath(paper.getFilePath());
        UUID uploadedById = paper.getUploadedBy() != null ? paper.getUploadedBy().getId() : null;

        boolean canEdit = currentUserId != null
                && paper.getUploadedBy() != null
                && currentUserId.equals(paper.getUploadedBy().getId());

        PaperResponse response = new PaperResponse(
                paper.getId(),
                paper.getTitle(),
                paper.getAuthor(),
                paper.getAbstractText(),
                paper.getUploadedAt(),
                paper.getPublicationYear(),
                filePath,
                paper.getCategories(),
                uploadedById,
                null,
                canEdit
        );

        AuthorInfo authorInfo = buildAuthorInfo(paper.getUploadedBy(), profileMap);
        if (authorInfo != null) {
            response.setAuthorInfo(authorInfo);
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

        if (local.length() <= 2) {
            return local.charAt(0) + "*@" + domain;
        }

        return local.charAt(0) + "***" + local.charAt(local.length() - 1) + "@" + domain;
    }
}
