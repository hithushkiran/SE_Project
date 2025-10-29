package com.researchhub.backend.controller;

import com.researchhub.backend.dto.LibraryItemDTO;
import com.researchhub.backend.service.LibraryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/library")
public class LibraryController {

    private static final Logger logger = LoggerFactory.getLogger(LibraryController.class);

    private final LibraryService libraryService;

    public LibraryController(LibraryService libraryService) {
        this.libraryService = libraryService;
    }

    @PostMapping("/{paperId}")
    public ResponseEntity<LibraryItemDTO> add(
            @PathVariable UUID paperId,
            Authentication authentication
    ) {
        UUID userId = getUserId(authentication);
        if (userId == null) {
            logger.warn("Add to library denied for paper {} due to missing authentication", paperId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        boolean alreadyExists = libraryService.isInLibrary(userId, paperId);
        LibraryItemDTO item = libraryService.add(userId, paperId);
        HttpStatus status = alreadyExists ? HttpStatus.OK : HttpStatus.CREATED;
        logger.debug("Library add processed for user {} paper {} status {}", userId, paperId, status);
        return ResponseEntity.status(status).body(item);
    }

    @GetMapping
    public ResponseEntity<Page<LibraryItemDTO>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        UUID userId = getUserId(authentication);
        if (userId == null) {
            logger.warn("Library list requested without authentication");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<LibraryItemDTO> items = libraryService.list(userId, pageable);
        logger.debug("Library list returned {} items for user {}", items.getNumberOfElements(), userId);
        return ResponseEntity.ok(items);
    }

    @DeleteMapping("/{paperId}")
    public ResponseEntity<Void> remove(
            @PathVariable UUID paperId,
            Authentication authentication
    ) {
        UUID userId = getUserId(authentication);
        if (userId == null) {
            logger.warn("Remove from library denied for paper {} due to missing authentication", paperId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        libraryService.remove(userId, paperId);
        logger.debug("Library remove processed for user {} paper {}", userId, paperId);
        return ResponseEntity.noContent().build();
    }

    private UUID getUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        try {
            return UUID.fromString(authentication.getName());
        } catch (IllegalArgumentException ex) {
            logger.warn("Authentication principal [{}] is not a valid UUID", authentication.getName());
            return null;
        }
    }
}
