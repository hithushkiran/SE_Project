package com.researchhub.backend.service;

import com.researchhub.backend.exception.ResourceNotFoundException;
import com.researchhub.backend.model.Paper;
import com.researchhub.backend.model.User;
import com.researchhub.backend.repository.PaperRepository;
import com.researchhub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LibraryService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaperRepository paperRepository;

    @Transactional
    public void addToLibrary(UUID userId, UUID paperId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new ResourceNotFoundException("Paper not found"));

        user.getLibrary().add(paper);
        userRepository.save(user);
    }

    @Transactional
    public void removeFromLibrary(UUID userId, UUID paperId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new ResourceNotFoundException("Paper not found"));

        user.getLibrary().remove(paper);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<Paper> getUserLibrary(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getLibrary().stream().collect(Collectors.toList());
    }
}


