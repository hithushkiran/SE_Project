package com.researchhub.backend.service;

import com.researchhub.backend.dto.*;
import com.researchhub.backend.model.*;
import com.researchhub.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaperRepository paperRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationService notificationService;

    // ================= USER MANAGEMENT =================
    public Page<UserResponse> getAllUsers(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<User> users = userRepository.findAll(pageable);
        return users.map(this::toUserResponse);
    }

    public UserResponse getUserById(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toUserResponse(user);
    }

    @Transactional
    public void suspendUser(UUID userId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(Role.USER); // downgrade to basic user
        userRepository.save(user);

        notificationService.createNotification(
                user.getId(),
                "Account Suspended",
                "Your account has been suspended. Reason: " + reason,
                NotificationType.USER_SUSPENDED,
                user.getId(),
                RelatedEntityType.USER
        );
    }

    @Transactional
    public void activateUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(Role.RESEARCHER);
        userRepository.save(user);

        notificationService.createNotification(
                user.getId(),
                "Account Activated",
                "Your account has been activated successfully.",
                NotificationType.USER_ACTIVATED,
                user.getId(),
                RelatedEntityType.USER
        );
    }

    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Paper> userPapers = paperRepository.findByAuthor(user.getEmail()); // changed to String author
        paperRepository.deleteAll(userPapers);

        List<Comment> userComments = commentRepository.findByAuthorId(userId);
        commentRepository.deleteAll(userComments);

        userRepository.delete(user);
    }

    // ================= PAPER MODERATION =================
    public Page<PaperResponse> getPendingPapers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("uploadedAt").descending());
        Page<Paper> papers = paperRepository.findByStatus(PaperStatus.PENDING, pageable);
        return papers.map(this::toPaperResponse);
    }

    public Page<PaperResponse> getAllPapers(int page, int size, String status, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Paper> papers = (status != null && !status.isEmpty())
                ? paperRepository.findByStatus(PaperStatus.valueOf(status.toUpperCase()), pageable)
                : paperRepository.findAll(pageable);

        return papers.map(this::toPaperResponse);
    }

    // ====== New method to fetch papers by author (String) ======
    public List<PaperResponse> getPapersByAuthor(String author) {
        List<Paper> papers = paperRepository.findByAuthor(author); // author is now String
        return papers.stream().map(this::toPaperResponse).collect(Collectors.toList());
    }

    @Transactional
    public void approvePaper(UUID paperId, UUID adminId) {
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found"));
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        paper.setStatus(PaperStatus.APPROVED);
        paper.setReviewedAt(LocalDateTime.now());
        paper.setReviewedBy(admin);
        paperRepository.save(paper);

        notificationService.createNotification(
                null, // authorId unknown, author is String
                "Paper Approved",
                "Your paper '" + paper.getTitle() + "' has been approved and is now visible.",
                NotificationType.PAPER_APPROVED,
                paper.getId(),
                RelatedEntityType.PAPER
        );
    }

    @Transactional
    public void rejectPaper(UUID paperId, String reason, UUID adminId) {
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found"));
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        paper.setStatus(PaperStatus.REJECTED);
        paper.setRejectionReason(reason);
        paper.setReviewedAt(LocalDateTime.now());
        paper.setReviewedBy(admin);
        paperRepository.save(paper);

        notificationService.createNotification(
                null, // authorId unknown
                "Paper Rejected",
                "Your paper '" + paper.getTitle() + "' has been rejected. Reason: " + reason,
                NotificationType.PAPER_REJECTED,
                paper.getId(),
                RelatedEntityType.PAPER
        );
    }

    // ================= COMMENT MODERATION =================
    public Page<CommentResponse> getAllComments(int page, int size, String status, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Comment> comments = (status != null && !status.isEmpty())
                ? commentRepository.findByStatus(CommentStatus.valueOf(status.toUpperCase()), pageable)
                : commentRepository.findAll(pageable);

        return comments.map(this::toCommentResponse);
    }

    @Transactional
    public void approveComment(UUID commentId, UUID adminId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        comment.setStatus(CommentStatus.APPROVED);
        comment.setModeratedAt(LocalDateTime.now());
        comment.setModeratedBy(admin);
        commentRepository.save(comment);
    }

    @Transactional
    public void rejectComment(UUID commentId, String reason, UUID adminId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        comment.setStatus(CommentStatus.REJECTED);
        comment.setModerationReason(reason);
        comment.setModeratedAt(LocalDateTime.now());
        comment.setModeratedBy(admin);
        commentRepository.save(comment);

        notificationService.createNotification(
                comment.getAuthor().getId(),
                "Comment Rejected",
                "Your comment has been rejected. Reason: " + reason,
                NotificationType.COMMENT_REJECTED,
                comment.getId(),
                RelatedEntityType.COMMENT
        );
    }

    // ================= DASHBOARD STATS =================
    public AdminDashboardStats getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalPapers = paperRepository.count();
        long pendingPapers = paperRepository.countByStatus(PaperStatus.PENDING);
        long totalComments = commentRepository.count();
        long unreadNotifications = notificationRepository.countUnreadAdminNotifications();

        return new AdminDashboardStats(
                totalUsers,
                totalPapers,
                pendingPapers,
                totalComments,
                unreadNotifications
        );
    }

    // ================= HELPER DTO CONVERSIONS =================
    private UserResponse toUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().toString());
        response.setEmailVerified(user.isEmailVerified());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }

    private PaperResponse toPaperResponse(Paper paper) {
        PaperResponse response = new PaperResponse();
        response.setId(paper.getId());
        response.setTitle(paper.getTitle());
        response.setAuthor(paper.getAuthor()); // String
        response.setFilePath(paper.getFilePath());
        response.setUploadedAt(paper.getUploadedAt());
        response.setPublicationYear(paper.getPublicationYear());
        response.setAbstractText(paper.getAbstractText());
        response.setStatus(paper.getStatus().toString());
        response.setRejectionReason(paper.getRejectionReason());
        response.setReviewedAt(paper.getReviewedAt());
        return response;
    }

    private CommentResponse toCommentResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setAuthorId(comment.getAuthor().getId());
        response.setAuthorName(comment.getAuthor().getEmail());
        response.setPaperId(comment.getPaper().getId());
        response.setCreatedAt(comment.getCreatedAt());
        response.setUpdatedAt(comment.getUpdatedAt());
        response.setEdited(comment.isEdited());
        response.setStatus(comment.getStatus().toString());
        response.setModerationReason(comment.getModerationReason());
        response.setModeratedAt(comment.getModeratedAt());
        return response;
    }
}
