package com.researchhub.backend.service;

import com.researchhub.backend.dto.*;
import com.researchhub.backend.model.*;
import com.researchhub.backend.repository.*;
import com.researchhub.backend.util.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public void signup(RegisterRequest request, HttpServletResponse response) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        // Create and save user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        userRepository.save(user);

        // Create and save profile
        Profile profile = new Profile();
        profile.setUser(user);
        profile.setFullName(request.getFullName());
        profileRepository.save(profile);

        // Generate JWT and set cookie
        String token = jwtUtil.generateToken(user.getId());
        Cookie cookie = jwtUtil.createHttpOnlyCookie(token);
        response.addCookie(cookie);
    }

    public void login(LoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getId());
        Cookie cookie = jwtUtil.createHttpOnlyCookie(token);
        response.addCookie(cookie);
    }

    public void logout(HttpServletResponse response) {
        Cookie cookie = jwtUtil.clearCookie();
        response.addCookie(cookie);
    }

    public void resetPassword(ResetPasswordRequest request) {
        UUID userId = jwtUtil.validateTokenAndGetUserId(request.getToken());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
