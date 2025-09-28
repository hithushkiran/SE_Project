
package com.researchhub.backend.service;

import com.researchhub.backend.model.Category;
import com.researchhub.backend.repository.CategoryRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CategoryService {

    private static final Logger logger = LoggerFactory.getLogger(CategoryService.class);

    @Autowired
    private CategoryRepository categoryRepository;

    private final List<String> PREDEFINED_CATEGORIES = Arrays.asList(
            "Artificial Intelligence", "Machine Learning", "Data Science", "Computer Vision",
            "Natural Language Processing", "Robotics", "Neuroscience", "Bioinformatics"
            // ... your categories
    );

    @PostConstruct
    public void initializePredefinedCategories() {
        logger.info("Initializing predefined categories...");

        for (String categoryName : PREDEFINED_CATEGORIES) {
            Optional<Category> existingCategory = categoryRepository.findByName(categoryName);
            if (existingCategory.isEmpty()) {
                Category category = new Category();
                category.setName(categoryName);
                category.setDescription("Research papers in " + categoryName);
                categoryRepository.save(category);
            }
        }
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAllOrderByName();
    }

    public Category getCategoryById(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }
}