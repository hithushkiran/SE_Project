package com.researchhub.backend.repository;

import com.researchhub.backend.model.Paper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaperRepository extends JpaRepository<Paper, UUID> {

    // Search papers with filters
    @Query("SELECT DISTINCT p FROM Paper p " +
            "LEFT JOIN p.categories c " +
            "WHERE (:query IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "       OR LOWER(p.abstractText) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "AND (:categoryIds IS NULL OR c.id IN :categoryIds) " +
            "AND (:year IS NULL OR p.publicationYear = :year) " +
            "AND (:author IS NULL OR LOWER(p.author) LIKE LOWER(CONCAT('%', :author, '%'))) " +
            "ORDER BY p.uploadedAt DESC")
    Page<Paper> searchPapers(@Param("query") String query,
                             @Param("categoryIds") List<UUID> categoryIds,
                             @Param("year") Integer year,
                             @Param("author") String author,
                             Pageable pageable);

    // Find papers by category IDs (for recommendations)
    @Query("SELECT DISTINCT p FROM Paper p " +
            "JOIN p.categories c " +
            "WHERE c.id IN :categoryIds " +
            "ORDER BY p.uploadedAt DESC")
    Page<Paper> findByCategoryIds(@Param("categoryIds") List<UUID> categoryIds, Pageable pageable);

    // Find recent papers (fallback for new users)
    Page<Paper> findByOrderByUploadedAtDesc(Pageable pageable);

    // Find papers by author
    List<Paper> findByAuthorContainingIgnoreCase(String author);

    // Find papers uploaded by a specific user
    Page<Paper> findByUploadedBy_IdOrderByUploadedAtDesc(UUID userId, Pageable pageable);
}


