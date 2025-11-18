package com.researchhub.backend.controller;

import com.researchhub.backend.dto.*;
import com.researchhub.backend.model.Notification;
import com.researchhub.backend.service.AdminService;
import com.researchhub.backend.service.NotificationService;
import com.researchhub.backend.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private JwtUtil jwtUtil;

    // Dashboard
    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<AdminDashboardStats>> getDashboardStats(HttpServletRequest request) {
        try {
            UUID adminId = jwtUtil.extractUserIdFromRequest(request);
            if (!isAdmin(adminId)) {
                return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
            }

            AdminDashboardStats stats = adminService.getDashboardStats();
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to fetch dashboard stats: " + e.getMessage()));
        }
    }

    // User Management
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            HttpServletRequest request) {
        try {
            UUID adminId = jwtUtil.extractUserIdFromRequest(request);
            if (!isAdmin(adminId)) {
                return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
            }

            Page<UserResponse> users = adminService.getAllUsers(page, size, sortBy, sortDir);
            return ResponseEntity.ok(ApiResponse.success(users));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to fetch users: " + e.getMessage()));
        }
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable UUID userId, HttpServletRequest request) {
        try {
            UUID adminId = jwtUtil.extractUserIdFromRequest(request);
            if (!isAdmin(adminId)) {
                return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
            }

            UserResponse user = adminService.getUserById(userId);
            return ResponseEntity.ok(ApiResponse.success(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to fetch user: " + e.getMessage()));
        }
    }

    @PostMapping("/users/{userId}/suspend")
    public ResponseEntity<ApiResponse<Void>> suspendUser(
            @PathVariable UUID userId,
            @RequestBody(required = false) String reason,
            HttpServletRequest request) {
        try {
            UUID adminId = jwtUtil.extractUserIdFromRequest(request);
            if (!isAdmin(adminId)) {
                return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
            }

            adminService.suspendUser(userId, reason != null ? reason : "No reason provided");
            return ResponseEntity.ok(ApiResponse.success("User suspended successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to suspend user: " + e.getMessage()));
        }
    }

    @PostMapping("/users/{userId}/activate")
    public ResponseEntity<ApiResponse<Void>> activateUser(@PathVariable UUID userId, HttpServletRequest request) {
        try {
            UUID adminId = jwtUtil.extractUserIdFromRequest(request);
            if (!isAdmin(adminId)) {
                return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
            }

            adminService.activateUser(userId);
            return ResponseEntity.ok(ApiResponse.success("User activated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to activate user: " + e.getMessage()));
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID userId, HttpServletRequest request) {
        try {
            UUID adminId = jwtUtil.extractUserIdFromRequest(request);
            if (!isAdmin(adminId)) {
                return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
            }

            adminService.deleteUser(userId);
            return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to delete user: " + e.getMessage()));
        }
    }

    // Paper Moderation
    @GetMapping("/papers")
    public ResponseEntity<ApiResponse<Page<PaperResponse>>> getAllPapers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "uploadedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            HttpServletRequest request) {
        try {
            UUID adminId = jwtUtil.extractUserIdFromRequest(request);
            if (!isAdmin(adminId)) {
                return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
            }

            Page<PaperResponse> papers = adminService.getAllPapers(page, size, status, sortBy, sortDir);
            return ResponseEntity.ok(ApiResponse.success(papers));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to fetch papers: " + e.getMessage()));
        }
    }

    @GetMapping("/papers/pending")
    public ResponseEntity<ApiResponse<Page<PaperResponse>>> getPendingPapers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        try {
            UUID adminId = jwtUtil.extractUserIdFromRequest(request);
            if (!isAdmin(adminId)) {
                return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
            }

            Page<PaperResponse> papers = adminService.getPendingPapers(page, size);
            return ResponseEntity.ok(ApiResponse.success(papers));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to fetch pending papers: " + e.getMessage()));
        }
    }

    @PostMapping("/papers/{paperId}/approve")
    public ResponseEntity<ApiResponse<Void>> approvePaper(@PathVariable UUID paperId, HttpServletRequest request) {
        try {
            UUID adminId = jwtUtil.extractUserIdFromRequest(request);
            if (!isAdmin(adminId)) {
                return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
            }

            adminService.approvePaper(paperId, adminId);
            return ResponseEntity.ok(ApiResponse.success("Paper approved successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to approve paper: " + e.getMessage()));
        }
    }

    @PostMapping("/papers/{paperId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectPaper(
            @PathVariable UUID paperId,
            @RequestBody String reason,
            HttpServletRequest request) {
        try {
            UUID adminId = jwtUtil.extractUserIdFromRequest(request);
            if (!isAdmin(adminId)) {
                return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
            }

            adminService.rejectPaper(paperId, reason, adminId);
            return ResponseEntity.ok(ApiResponse.success("Paper rejected successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to reject paper: " + e.getMessage()));
        }
    }

    // Comment Moderation
    @GetMapping("/comments")
    public ResponseEntity<ApiResponse<Page<CommentResponse>>> getAllComments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            HttpServletRequest request) {
        try {
            UUID adminId = jwtUtil.extractUserIdFromRequest(request);
            if (!isAdmin(adminId)) {
                return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
            }

            Page<CommentResponse> comments = adminService.getAllComments(page, size, status, sortBy, sortDir);
            return ResponseEntity.ok(ApiResponse.success(comments));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to fetch comments: " + e.getMessage()));
        }
    }

    @PostMapping("/comments/{commentId}/approve")
    public ResponseEntity<ApiResponse<Void>> approveComment(@PathVariable UUID commentId, HttpServletRequest request) {
        try {
            UUID adminId = jwtUtil.extractUserIdFromRequest(request);
            if (!isAdmin(adminId)) {
                return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
            }

            adminService.approveComment(commentId, adminId);
            return ResponseEntity.ok(ApiResponse.success("Comment approved successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to approve comment: " + e.getMessage()));
        }
    }

    @PostMapping("/comments/{commentId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectComment(
            @PathVariable UUID commentId,
            @RequestBody String reason,
            HttpServletRequest request) {
        try {
            UUID adminId = jwtUtil.extractUserIdFromRequest(request);
            if (!isAdmin(adminId)) {
                return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
            }

            adminService.rejectComment(commentId, reason, adminId);
            return ResponseEntity.ok(ApiResponse.success("Comment rejected successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to reject comment: " + e.getMessage()));
        }
    }

    // Notifications
    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        try {
            UUID adminId = jwtUtil.extractUserIdFromRequest(request);
            if (!isAdmin(adminId)) {
                return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
            }

            List<Notification> notifications = notificationService.getUserNotifications(adminId, page, size);
            List<NotificationResponse> responses = notifications.stream()
                    .map(this::toNotificationResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(responses));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to fetch notifications: " + e.getMessage()));
        }
    }

    @PostMapping("/notifications/{notificationId}/read")
    public ResponseEntity<ApiResponse<Void>> markNotificationAsRead(@PathVariable UUID notificationId, HttpServletRequest request) {
        try {
            UUID adminId = jwtUtil.extractUserIdFromRequest(request);
            if (!isAdmin(adminId)) {
                return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
            }

            notificationService.markAsRead(notificationId, adminId);
            return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to mark notification as read: " + e.getMessage()));
        }
    }

    private boolean isAdmin(UUID userId) {
        // Simplified: implement proper role check
        return true;
    }

    private NotificationResponse toNotificationResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setType(notification.getType().toString());
        response.setRead(notification.isRead());
        response.setCreatedAt(notification.getCreatedAt());
        response.setReadAt(notification.getReadAt());
        response.setRelatedEntityId(notification.getRelatedEntityId());
        response.setRelatedEntityType(notification.getRelatedEntityType() != null ? notification.getRelatedEntityType().toString() : null);
        return response;
    }
}
