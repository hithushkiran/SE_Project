package com.researchhub.backend.service;

import com.researchhub.backend.exception.ResourceNotFoundException;
import com.researchhub.backend.model.Paper;
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
import java.util.UUID;

@Service
public class PaperService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Autowired
    private PaperRepository paperRepository;

    @Transactional
    public Paper uploadPaper(MultipartFile file, String title, String author) throws IOException {
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

        // Persist paper metadata
        Paper paper = new Paper();
        paper.setTitle(title != null && !title.isBlank() ? title : (original != null ? original.replace(extension, "") : "Untitled"));
        paper.setAuthor(author);
        paper.setFilePath(destination.toString());

        return paperRepository.save(paper);
    }

    @Transactional
    public void deletePaper(UUID paperId) throws IOException {
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new ResourceNotFoundException("Paper not found"));

        // Remove physical file if exists
        if (paper.getFilePath() != null) {
            Path path = Paths.get(paper.getFilePath());
            try {
                Files.deleteIfExists(path);
            } catch (IOException e) {
                // proceed to delete DB record even if file deletion fails
            }
        }

        paperRepository.delete(paper);
    }
}


