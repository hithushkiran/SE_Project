package com.researchhub.backend.service;

import com.researchhub.backend.exception.ResourceNotFoundException;
import com.researchhub.backend.model.Category;
import com.researchhub.backend.model.Paper;
import com.researchhub.backend.repository.CategoryRepository;
import com.researchhub.backend.repository.PaperRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Service
public class PaperService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Autowired
    private PaperRepository paperRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    // ===== YOUR EXISTING METHODS =====

    @Transactional
    public Paper uploadPaper(MultipartFile file, String title, String author) throws IOException {
        // Delegate to the full method with null year & abstract
        return uploadPaper(file, title, author, null, null);
    }

    /**
     * Overloaded upload accepting publicationYear & abstractText.
     * If publicationYear is null or invalid (< 1900 or > current year +1), it will be set to current year.
     */
    @Transactional
    public Paper uploadPaper(MultipartFile file, String title, String author, Integer publicationYear, String abstractText) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }

        // Ensure directory exists
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        // Generate filename with UUID to avoid collisions
        String original = file.getOriginalFilename();
        String extension = (original != null && original.contains(".")) ? original.substring(original.lastIndexOf('.')) : ".pdf";
        String filename = UUID.randomUUID() + extension;
        Path destination = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), destination);

        int currentYear = Calendar.getInstance().get(Calendar.YEAR);
        Integer safeYear = publicationYear;
        if (safeYear != null) {
            if (safeYear < 1900 || safeYear > currentYear + 1) {
                safeYear = currentYear; // sanitize
            }
        }

        // Persist paper metadata
        Paper paper = new Paper();
        paper.setTitle(title != null && !title.isBlank() ? title : (original != null ? original.replace(extension, "") : "Untitled"));
        paper.setAuthor(author);
        // Store relative path for static resource access
        paper.setFilePath(filename);
        paper.setPublicationYear(safeYear != null ? safeYear : currentYear); // auto year if missing
        if (abstractText != null && !abstractText.isBlank()) {
            paper.setAbstractText(abstractText.trim());
        }

        return paperRepository.save(paper);
    }

    @Transactional
    public void deletePaper(UUID paperId) throws IOException {
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new ResourceNotFoundException("Paper not found"));

        // Remove physical file if exists
        if (paper.getFilePath() != null) {
            Path path = Paths.get(uploadDir).resolve(paper.getFilePath());
            try {
                Files.deleteIfExists(path);
            } catch (IOException e) {
                // proceed to delete DB record even if file deletion fails
            }
        }

        paperRepository.delete(paper);
    }

    // ===== NEW METHODS NEEDED FOR CONTROLLER =====

    public Paper getPaperById(UUID id) {
        return paperRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paper not found with id: " + id));
    }

    public List<Paper> getAllPapers() {
        return paperRepository.findAll();
    }

    /**
     * NEW: Upload paper with categories in one operation
     */
    @Transactional
    public Paper uploadPaperWithCategories(MultipartFile file, String title, String author, List<UUID> categoryIds) throws IOException {
        Paper paper = uploadPaper(file, title, author);
        if (categoryIds != null && !categoryIds.isEmpty()) {
            paper = assignCategoriesToPaper(paper.getId(), categoryIds);
        }
        return paper;
    }

    /**
     * Overload supporting publicationYear & abstractText.
     */
    public Paper uploadPaperWithCategories(MultipartFile file, String title, String author,
                                           Integer publicationYear, String abstractText,
                                           List<UUID> categoryIds) throws IOException {
        // First upload with extended metadata
        Paper paper = uploadPaper(file, title, author, publicationYear, abstractText);

        if (categoryIds != null && !categoryIds.isEmpty()) {
            paper = assignCategoriesToPaper(paper.getId(), categoryIds);
        }

        return paper;
    }

    /**
     * NEW: Assign categories to an existing paper
     */
    @Transactional
    public Paper assignCategoriesToPaper(UUID paperId, List<UUID> categoryIds) {
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new ResourceNotFoundException("Paper not found with id: " + paperId));

        if (categoryIds == null || categoryIds.isEmpty()) {
            // Clear categories if empty list provided
            paper.getCategories().clear();
        } else {
            // Get categories from database
            List<Category> categories = categoryRepository.findByIdIn(categoryIds);
            if (categories.size() != categoryIds.size()) {
                throw new IllegalArgumentException("Some categories were not found");
            }

            // Clear existing categories and assign new ones
            paper.getCategories().clear();
            paper.getCategories().addAll(new HashSet<>(categories));
        }

        return paperRepository.save(paper);
    }

    /**
     * NEW: Get categories for a paper
     */
    public Set<Category> getPaperCategories(UUID paperId) {
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new ResourceNotFoundException("Paper not found with id: " + paperId));

        return paper.getCategories() != null ? paper.getCategories() : new HashSet<>();
    }

    /**
     * NEW: Get recent papers (for explore system)
     */
    public List<Paper> getRecentPapers(int limit) {
        List<Paper> allPapers = paperRepository.findAll();

        // Sort by uploaded date (newest first) and limit results
        return allPapers.stream()
                .sorted((p1, p2) -> p2.getUploadedAt().compareTo(p1.getUploadedAt()))
                .limit(limit)
                .toList();
    }

    /**
     * NEW: Search papers by keyword (basic search)
     */
    public List<Paper> searchPapers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return paperRepository.findAll();
        }

        String searchTerm = query.toLowerCase().trim();
        List<Paper> allPapers = paperRepository.findAll();

        // Simple search in title, author, and abstract
        return allPapers.stream()
                .filter(paper ->
                        (paper.getTitle() != null && paper.getTitle().toLowerCase().contains(searchTerm)) ||
                                (paper.getAuthor() != null && paper.getAuthor().toLowerCase().contains(searchTerm)) ||
                                (paper.getAbstractText() != null && paper.getAbstractText().toLowerCase().contains(searchTerm))
                )
                .toList();
    }

    /**
     * NEW: Check if user can edit paper (for authorization)
     */
    public boolean canUserEditPaper(UUID paperId, UUID userId) {
        // For now, return true - you can implement proper authorization later
        // This would typically check if the user is the uploader or has admin role
        return true;
    }

    /**
     * NEW: Increment view count for a paper
     */
    @Transactional
    public Paper incrementViewCount(UUID paperId) {
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new ResourceNotFoundException("Paper not found with id: " + paperId));
        
        paper.setViewCount(paper.getViewCount() + 1);
        return paperRepository.save(paper);
    }
}

