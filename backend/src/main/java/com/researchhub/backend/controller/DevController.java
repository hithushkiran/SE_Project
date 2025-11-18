package com.researchhub.backend.controller;

import com.researchhub.backend.model.Role;
import com.researchhub.backend.model.User;
import com.researchhub.backend.repository.ProfileRepository;
import com.researchhub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletResponse;
import com.researchhub.backend.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Development-only utility endpoints.
 * NOTE: Remove or secure these endpoints before deploying to production.
 */
@RestController
@RequestMapping("/api/dev")
public class DevController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin(@RequestBody Map<String, String> body, HttpServletResponse response) {
        String email = body.get("email");
        String password = body.get("password");
        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "email and password required"));
        }

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "User already exists"));
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(Role.ADMIN);
        userRepository.save(user);

        // Create an empty profile
        var profile = new com.researchhub.backend.model.Profile();
        profile.setUser(user);
        profile.setFullName("Administrator");
        profileRepository.save(profile);

        // Generate JWT and set HttpOnly cookie so browser is authenticated immediately (dev convenience)
        try {
            var token = jwtUtil.generateToken(user.getId());
            var cookie = jwtUtil.createHttpOnlyCookie(token);
            response.addCookie(cookie);
        } catch (Exception e) {
            // Ignore cookie set failures for dev endpoint; still return success
        }

        return ResponseEntity.ok(Map.of("success", true, "message", "Admin created"));
    }
}
