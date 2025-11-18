package com.researchhub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStats {
    private long totalUsers;
    private long totalPapers;
    private long pendingPapers;
    private long totalComments;
    private long unreadNotifications;
}
