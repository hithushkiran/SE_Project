package com.researchhub.backend.repository;

import com.researchhub.backend.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    
    // Find all comments for a paper, ordered by creation date (newest first)
    List<Comment> findByPaperIdOrderByCreatedAtDesc(UUID paperId);
    
    // Find all comments for a paper, ordered by creation date (oldest first)
    List<Comment> findByPaperIdOrderByCreatedAtAsc(UUID paperId);
    
    // Count comments for a paper
    int countByPaperId(UUID paperId);
    
    // Find comment by ID and author ID (for authorization checks)
    @Query("SELECT c FROM Comment c WHERE c.id = :commentId AND c.author.id = :authorId")
    Optional<Comment> findByIdAndAuthorId(@Param("commentId") UUID commentId, 
                                         @Param("authorId") UUID authorId);
    
    // Check if comment exists and belongs to paper
    boolean existsByIdAndPaperId(UUID commentId, UUID paperId);
}
