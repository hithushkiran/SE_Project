package com.researchhub.backend.service;

import com.researchhub.backend.dto.CommentRequest;
import com.researchhub.backend.model.Comment;
import com.researchhub.backend.model.Paper;
import com.researchhub.backend.model.User;
import com.researchhub.backend.repository.CommentRepository;
import com.researchhub.backend.repository.PaperRepository;
import com.researchhub.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CommentService {
    
    private static final Logger logger = LoggerFactory.getLogger(CommentService.class);
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private PaperRepository paperRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Transactional
    public Comment createComment(UUID paperId, String content, UUID authorId) {
        logger.info("Creating comment for paper: {} by user: {}", paperId, authorId);
        
        // Validate paper exists
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found with id: " + paperId));
        
        // Validate user exists
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + authorId));
        
        // Create and save comment
        Comment comment = new Comment();
        comment.setContent(content);
        comment.setPaper(paper);
        comment.setAuthor(author);
        
        Comment savedComment = commentRepository.save(comment);
        logger.info("Comment created successfully with ID: {}", savedComment.getId());
        
        return savedComment;
    }
    
    public List<Comment> getPaperComments(UUID paperId) {
        logger.info("Fetching comments for paper: {}", paperId);
        
        // Validate paper exists
        if (!paperRepository.existsById(paperId)) {
            throw new RuntimeException("Paper not found with id: " + paperId);
        }
        
        return commentRepository.findByPaperIdOrderByCreatedAtDesc(paperId);
    }
    
    @Transactional
    public Comment updateComment(UUID commentId, String newContent, UUID userId) {
        logger.info("Updating comment: {} by user: {}", commentId, userId);
        
        // Find comment and verify ownership
        Comment comment = commentRepository.findByIdAndAuthorId(commentId, userId)
                .orElseThrow(() -> new RuntimeException("Comment not found or access denied"));
        
        comment.setContent(newContent);
        Comment updatedComment = commentRepository.save(comment);
        logger.info("Comment updated successfully");
        
        return updatedComment;
    }
    
    @Transactional
    public void deleteComment(UUID commentId, UUID userId) {
        logger.info("Deleting comment: {} by user: {}", commentId, userId);
        
        // Find comment and verify ownership
        Comment comment = commentRepository.findByIdAndAuthorId(commentId, userId)
                .orElseThrow(() -> new RuntimeException("Comment not found or access denied"));
        
        commentRepository.delete(comment);
        logger.info("Comment deleted successfully");
    }
    
    public int getCommentCount(UUID paperId) {
        return commentRepository.countByPaperId(paperId);
    }
    
    public boolean canUserEditComment(UUID commentId, UUID userId) {
        return commentRepository.findByIdAndAuthorId(commentId, userId).isPresent();
    }
}
