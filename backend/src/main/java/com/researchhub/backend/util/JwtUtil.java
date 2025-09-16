package com.researchhub.backend.util;

import io.jsonwebtoken.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    private final String SECRET = "your-secret-key"; // Replace with a secure key from application.properties
    private final long EXPIRATION = 86400000; // 1 day in milliseconds

    // Generate JWT token from user ID
    public String generateToken(UUID userId) {
        return Jwts.builder()
                .setSubject(userId.toString())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(SignatureAlgorithm.HS256, SECRET)
                .compact();
    }

    // Validate token and extract user ID
    public UUID validateTokenAndGetUserId(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(SECRET)
                    .parseClaimsJws(token)
                    .getBody();
            return UUID.fromString(claims.getSubject());
        } catch (JwtException | IllegalArgumentException e) {
            throw new RuntimeException("Invalid or expired JWT token");
        }
    }

    // Create HttpOnly cookie with JWT
    public Cookie createHttpOnlyCookie(String token) {
        Cookie cookie = new Cookie("jwt", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge((int) (EXPIRATION / 1000)); // seconds
        return cookie;
    }

    // Clear JWT cookie
    public Cookie clearCookie() {
        Cookie cookie = new Cookie("jwt", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        return cookie;
    }

    // Extract JWT from request cookies and return user ID
    public UUID extractUserIdFromRequest(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) throw new RuntimeException("No cookies found");

        for (Cookie cookie : cookies) {
            if ("jwt".equals(cookie.getName())) {
                return validateTokenAndGetUserId(cookie.getValue());
            }
        }
        throw new RuntimeException("JWT cookie not found");
    }
}



