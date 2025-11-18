package com.researchhub.backend.service;

import com.researchhub.backend.dto.PaperSearchRequest;
import com.researchhub.backend.model.Category;
import com.researchhub.backend.model.Paper;
import com.researchhub.backend.model.Profile;
import com.researchhub.backend.repository.PaperRepository;
import com.researchhub.backend.repository.ProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaperSearchService {

    private static final Logger logger = LoggerFactory.getLogger(PaperSearchService.class);

    @Autowired
    private PaperRepository paperRepository;

    @Autowired
    private ProfileRepository profileRepository;

    public Page<Paper> searchPapers(PaperSearchRequest request, Pageable pageable) {
        logger.info("Searching papers with query: {}, categories: {}, year: {}, author: {}",
                request.getQuery(), request.getCategoryIds(), request.getYear(), request.getAuthor());

        return paperRepository.searchPapers(
                request.getQuery(),
                request.getCategoryIds(),
                request.getYear(),
                request.getAuthor(),
                pageable
        );
    }

    public Page<Paper> getRecommendedPapers(UUID userId, Pageable pageable) {
        logger.info("Getting recommended papers for user: {}", userId);

        try {
            // Get user's profile with interests
            Profile profile = profileRepository.findByUserIdWithInterests(userId)
                    .orElse(null);

            // If profile not found or user has no interests, return recent papers
            Set<Category> interests = (profile != null) ? profile.getInterests() : null;
            if (interests == null || interests.isEmpty()) {
                logger.info("No profile or interests found for user {}, returning recent papers", userId);
                return paperRepository.findByOrderByUploadedAtDesc(pageable);
            }

            // Create a defensive copy to avoid ConcurrentModificationException
            List<UUID> interestIds = new java.util.ArrayList<>(interests).stream()
                    .map(category -> category.getId())
                    .collect(Collectors.toList());

            logger.info("Found {} interests for user {}", interestIds.size(), userId);
            return paperRepository.findByCategoryIds(interestIds, pageable);
        } catch (Exception e) {
            logger.error("Error getting recommended papers for user {}: {}", userId, e.getMessage(), e);
            // Fallback: return recent papers on any error
            return paperRepository.findByOrderByUploadedAtDesc(pageable);
        }
    }

    public Page<Paper> getAllPapers(Pageable pageable) {
        logger.info("Getting all papers for public access");
        return paperRepository.findByOrderByUploadedAtDesc(pageable);
    }
}