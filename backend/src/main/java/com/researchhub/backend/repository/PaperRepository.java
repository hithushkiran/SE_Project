package com.researchhub.backend.repository;

import com.researchhub.backend.model.Paper;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PaperRepository extends JpaRepository<Paper, UUID> {
}


