package com.researchhub.backend.service;

import com.researchhub.backend.model.Paper;
import com.researchhub.backend.repository.PaperRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MockDataService {

    @Autowired
    private PaperRepository paperRepository;

    @PostConstruct
    public void createMockData() {
        if (paperRepository.count() == 0) {
            System.out.println("=== CREATING SIMPLE MOCK DATA ===");

            // Create papers WITHOUT touching categories at all
            createPaper("Advanced Machine Learning Techniques", "Dr. Sarah Chen", 2024, "Exploring cutting-edge ML algorithms for predictive analytics in various domains including healthcare and finance.");
            createPaper("Real-Time Object Detection Systems", "Dr. James Rodriguez", 2023, "Novel computer vision approach for autonomous vehicle navigation with improved obstacle detection accuracy.");
            createPaper("Big Data Analytics in Healthcare", "Dr. Emily Wang", 2024, "Using data science and machine learning to optimize hospital operations and improve patient care delivery.");
            createPaper("Blockchain Security Protocols", "Dr. Michael Brown", 2023, "Advanced blockchain security mechanisms for secure financial transactions and data integrity.");
            createPaper("Climate Change Impact Analysis", "Dr. Lisa Johnson", 2024, "Comprehensive study on the effects of climate change on global ecosystems and biodiversity.");
            createPaper("Quantum Computing Advances", "Dr. Robert Kim", 2023, "Breakthrough research in quantum computing algorithms and their practical applications.");

            System.out.println("=== MOCK DATA CREATION COMPLETED ===");
            System.out.println("Created " + paperRepository.count() + " papers successfully!");
        } else {
            System.out.println("Database already contains " + paperRepository.count() + " papers. Skipping mock data creation.");
        }
    }

    private void createPaper(String title, String author, int year, String abstractText) {
        try {
            Paper paper = new Paper();
            paper.setTitle(title);
            paper.setAuthor(author);
            paper.setAbstractText(abstractText);
            paper.setPublicationYear(year);
            paper.setFilePath("uploads/" + title.replace(" ", "-").toLowerCase() + ".pdf");

            paperRepository.save(paper);
            System.out.println("Created paper: " + title);

        } catch (Exception e) {
            System.out.println("Error creating paper '" + title + "': " + e.getMessage());
        }
    }
}