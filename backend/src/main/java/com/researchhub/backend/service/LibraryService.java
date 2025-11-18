package com.researchhub.backend.service;

import com.researchhub.backend.dto.PaperResponse;
import com.researchhub.backend.exception.ResourceNotFoundException;
import com.researchhub.backend.model.Paper;
import com.researchhub.backend.model.User;
import com.researchhub.backend.repository.PaperRepository;
import com.researchhub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LibraryService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaperRepository paperRepository;

    @Autowired
    private PaperResponseService paperResponseService;

    @Transactional
    public boolean addToLibrary(UUID userId, UUID paperId) {
        User user = userRepository.findByIdWithLibrary(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new ResourceNotFoundException("Paper not found"));

        boolean alreadySaved = user.getLibrary().stream()
                .anyMatch(savedPaper -> paperId.equals(savedPaper.getId()));
        if (alreadySaved) {
            return false;
        }

        user.getLibrary().add(paper);
        userRepository.save(user);
        return true;
    }

    @Transactional
    public void removeFromLibrary(UUID userId, UUID paperId) {
        User user = userRepository.findByIdWithLibrary(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new ResourceNotFoundException("Paper not found"));

        user.getLibrary().remove(paper);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<PaperResponse> getUserLibrary(UUID userId) {
        User user = userRepository.findByIdWithLibrary(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Paper> sortedPapers = user.getLibrary().stream()
                .sorted(Comparator.comparing(Paper::getUploadedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .collect(Collectors.toList());
        return paperResponseService.toPaperResponse(sortedPapers);
    }
}


