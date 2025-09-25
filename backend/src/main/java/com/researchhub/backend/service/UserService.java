package com.researchhub.backend.service;

import com.researchhub.backend.dto.UpdateProfileRequest;
import com.researchhub.backend.dto.UserResponse;
import com.researchhub.backend.model.Profile;
import com.researchhub.backend.model.User;
import com.researchhub.backend.repository.ProfileRepository;
import com.researchhub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    

    public UserResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        Profile profile = profileRepository.findById(userId).orElseThrow();

        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setEmailVerified(user.isEmailVerified());
        response.setRole(user.getRole().name());
        response.setFullName(profile.getFullName());
        response.setAffiliation(profile.getAffiliation());
        response.setBio(profile.getBio());
        response.setWebsite(profile.getWebsite());
        response.setAvatarUrl(profile.getAvatarUrl());

        return response;
    }

    public void updateProfile(UUID userId, UpdateProfileRequest request) {
        Profile profile = profileRepository.findById(userId).orElseThrow();

        profile.setFullName(request.getFullName());
        profile.setAffiliation(request.getAffiliation());
        profile.setBio(request.getBio());
        profile.setWebsite(request.getWebsite());
        profile.setAvatarUrl(request.getAvatarUrl());

        profileRepository.save(profile);
    }
}
