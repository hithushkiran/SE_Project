package com.researchhub.backend.repository;

import com.researchhub.backend.model.Notification;
import com.researchhub.backend.model.NotificationType;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    Page<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);


    List<Notification> findByUserIdAndIsReadOrderByCreatedAtDesc(UUID userId, boolean isRead);
    
    long countByUserIdAndIsRead(UUID userId, boolean isRead);
    
    @Query("SELECT n FROM Notification n WHERE n.user.role = 'ADMIN' AND n.type IN :types ORDER BY n.createdAt DESC")
    List<Notification> findAdminNotificationsByTypes(@Param("types") List<NotificationType> types);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.role = 'ADMIN' AND n.isRead = false")
    long countUnreadAdminNotifications();
}
