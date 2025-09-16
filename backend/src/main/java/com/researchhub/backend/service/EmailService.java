package com.researchhub.backend.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {

    public void sendResetLink(String email, String token) {
        // Stub: Implement email sending logic here
        System.out.println("Sending reset link to " + email + " with token: " + token);
    }
}

