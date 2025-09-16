package com.researchhub.backend.controller;

import com.researchhub.backend.dto.*;
import com.researchhub.backend.service.AuthService;
import com.researchhub.backend.service.UserService;
import com.researchhub.backend.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/signup")
    public void signup(@RequestBody RegisterRequest request, HttpServletResponse response) {
        authService.signup(request, response);
    }

    @PostMapping("/login")
    public void login(@RequestBody LoginRequest request, HttpServletResponse response) {
        authService.login(request, response);
    }

    @PostMapping("/logout")
    public void logout(HttpServletResponse response) {
        authService.logout(response);
    }

    @PostMapping("/forgot-password")
    public void forgotPassword(@RequestBody ForgotPasswordRequest request) {
        // Stub: EmailService can be used here
    }

    @PostMapping("/reset-password")
    public void resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
    }

    @GetMapping("/profile")
    public UserResponse getProfile(HttpServletRequest request) {
        UUID userId = jwtUtil.extractUserIdFromRequest(request);
        return userService.getProfile(userId);
    }

    @PutMapping("/profile")
    public void updateProfile(@RequestBody UpdateProfileRequest request, HttpServletRequest httpRequest) {
        UUID userId = jwtUtil.extractUserIdFromRequest(httpRequest);
        userService.updateProfile(userId, request);
    }
}
