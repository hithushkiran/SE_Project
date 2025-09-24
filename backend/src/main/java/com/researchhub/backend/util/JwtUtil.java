package com.researchhub.backend.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256); // Secure 256-bit key
    private final long EXPIRATION = 86400000; // 1 day in milliseconds

    // Generate JWT token from user ID
    public String generateToken(UUID userId) {
        return Jwts.builder()
                .setSubject(userId.toString())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(key)
                .compact();
    }

    // Validate token and extract user ID
    public UUID validateTokenAndGetUserId(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
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
