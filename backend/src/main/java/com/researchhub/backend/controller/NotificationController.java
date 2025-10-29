package com.researchhub.backend.controller;

import com.researchhub.backend.dto.ApiResponse;
import com.researchhub.backend.dto.NotificationResponse;
import com.researchhub.backend.model.Notification;
import com.researchhub.backend.service.NotificationService;
import com.researchhub.backend.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUserNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        try {
            UUID userId = jwtUtil.extractUserIdFromRequest(request);
            List<Notification> notifications = notificationService.getUserNotifications(userId, page, size);
            List<NotificationResponse> responses = notifications.stream()
                    .map(this::toNotificationResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(responses));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to fetch notifications: " + e.getMessage()));
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUnreadNotifications(HttpServletRequest request) {
        try {
            UUID userId = jwtUtil.extractUserIdFromRequest(request);
            List<Notification> notifications = notificationService.getUnreadUserNotifications(userId);
            List<NotificationResponse> responses = notifications.stream()
                    .map(this::toNotificationResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(responses));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to fetch unread notifications: " + e.getMessage()));
        }
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(HttpServletRequest request) {
        try {
            UUID userId = jwtUtil.extractUserIdFromRequest(request);
            long count = notificationService.getUnreadNotificationCount(userId);
            return ResponseEntity.ok(ApiResponse.success(count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to fetch notification count: " + e.getMessage()));
        }
    }

    @PostMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<String>> markAsRead(@PathVariable UUID notificationId, HttpServletRequest request) {
        try {
            UUID userId = jwtUtil.extractUserIdFromRequest(request);
            notificationService.markAsRead(notificationId, userId);
            return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to mark notification as read: " + e.getMessage()));
        }
    }

    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<String>> markAllAsRead(HttpServletRequest request) {
        try {
            UUID userId = jwtUtil.extractUserIdFromRequest(request);
            notificationService.markAllAsRead(userId);
            return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to mark all notifications as read: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<ApiResponse<String>> deleteNotification(@PathVariable UUID notificationId, HttpServletRequest request) {
        try {
            UUID userId = jwtUtil.extractUserIdFromRequest(request);
            notificationService.deleteNotification(notificationId, userId);
            return ResponseEntity.ok(ApiResponse.success("Notification deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to delete notification: " + e.getMessage()));
        }
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
        response.setRelatedEntityType(
                notification.getRelatedEntityType() != null
                        ? notification.getRelatedEntityType().toString()
                        : null
        );
        return response;
    }
}
