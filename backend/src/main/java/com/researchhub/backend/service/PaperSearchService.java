package com.researchhub.backend.service;

import com.researchhub.backend.dto.PaperSearchRequest;
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

        // Get user's profile with interests
        Profile profile = profileRepository.findByUserIdWithInterests(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found for user: " + userId));

        // If user has interests, recommend papers from those categories
        if (profile.getInterests() != null && !profile.getInterests().isEmpty()) {
            List<UUID> interestIds = profile.getInterests().stream()
                    .map(category -> category.getId())
                    .collect(Collectors.toList());

            return paperRepository.findByCategoryIds(interestIds, pageable);
        } else {
            // Fallback: return recent papers if no interests set
            return paperRepository.findByOrderByUploadedAtDesc(pageable);
        }
    }

    public Page<Paper> getAllPapers(Pageable pageable) {
        logger.info("Getting all papers for public access");
        return paperRepository.findByOrderByUploadedAtDesc(pageable);
    }

    public Page<Paper> getTrendingPapers(Pageable pageable) {
        logger.info("Getting trending papers sorted by view count");
        return paperRepository.findAllByOrderByViewCountDesc(pageable);
    }
}
