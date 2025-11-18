package com.researchhub.backend.controller;

import com.researchhub.backend.dto.ApiResponse;
import com.researchhub.backend.dto.CommentRequest;
import com.researchhub.backend.dto.CommentResponse;
import com.researchhub.backend.model.Comment;
import com.researchhub.backend.model.User;
import com.researchhub.backend.service.CommentService;
import com.researchhub.backend.service.UserService;
import com.researchhub.backend.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/papers/{paperId}/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(
            @PathVariable UUID paperId,
            @Valid @RequestBody CommentRequest request,
            HttpServletRequest httpRequest) {

        try {
            UUID userId = jwtUtil.extractUserIdFromRequest(httpRequest);
            Comment comment = commentService.createComment(paperId, request.getContent(), userId);
            CommentResponse response = toCommentResponse(comment);

            return ResponseEntity.ok(ApiResponse.success("Comment created successfully", response));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to create comment: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getPaperComments(
            @PathVariable UUID paperId) {

        try {
            List<Comment> comments = commentService.getPaperComments(paperId);
            List<CommentResponse> response = comments.stream()
                    .map(this::toCommentResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch comments: " + e.getMessage()));
        }
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
            @PathVariable UUID paperId,
            @PathVariable UUID commentId,
            @Valid @RequestBody CommentRequest request,
            HttpServletRequest httpRequest) {

        try {
            UUID userId = jwtUtil.extractUserIdFromRequest(httpRequest);
            Comment comment = commentService.updateComment(commentId, request.getContent(), userId);
            CommentResponse response = toCommentResponse(comment);

            return ResponseEntity.ok(ApiResponse.success("Comment updated successfully", response));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update comment: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable UUID paperId,
            @PathVariable UUID commentId,
            HttpServletRequest httpRequest) {

        try {
            UUID userId = jwtUtil.extractUserIdFromRequest(httpRequest);
            commentService.deleteComment(commentId, userId);

            return ResponseEntity.ok(ApiResponse.success("Comment deleted successfully", null));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to delete comment: " + e.getMessage()));
        }
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Integer>> getCommentCount(@PathVariable UUID paperId) {
        try {
            int count = commentService.getCommentCount(paperId);
            return ResponseEntity.ok(ApiResponse.success(count));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get comment count: " + e.getMessage()));
        }
    }

    // ---------------- Helper methods ----------------
    private CommentResponse toCommentResponse(Comment comment) {
        User author = comment.getAuthor();

        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                comment.getPaper().getId(),
                author.getId(),                 // UUID
                getAuthorDisplayName(author),   // authorName as String
                comment.getCreatedAt(),
                comment.getUpdatedAt(),
                comment.isEdited(),
                comment.getStatus().toString(),
                comment.getModerationReason(),
                comment.getModeratedAt()
        );
    }

    private String getAuthorDisplayName(User user) {
        // Simple fallback: username from email
        return user.getEmail().split("@")[0];
    }
}
