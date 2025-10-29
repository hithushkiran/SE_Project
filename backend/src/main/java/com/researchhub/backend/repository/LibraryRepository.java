package com.researchhub.backend.repository;

import com.researchhub.backend.model.LibraryItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface LibraryRepository extends JpaRepository<LibraryItem, Long> {

    boolean existsByUserIdAndPaper_Id(UUID userId, UUID paperId);

    Optional<LibraryItem> findByUserIdAndPaper_Id(UUID userId, UUID paperId);

    @EntityGraph(attributePaths = "paper")
    Page<LibraryItem> findByUserId(UUID userId, Pageable pageable);

    void deleteByUserIdAndPaper_Id(UUID userId, UUID paperId);
}
