package com.researchhub.backend.service;

import com.researchhub.backend.dto.LibraryItemDTO;
import com.researchhub.backend.dto.PaperResponse;
import com.researchhub.backend.exception.ResourceNotFoundException;
import com.researchhub.backend.model.LibraryItem;
import com.researchhub.backend.model.Paper;
import com.researchhub.backend.repository.LibraryRepository;
import com.researchhub.backend.repository.PaperRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@Transactional
public class LibraryService {

    private final LibraryRepository libraryRepository;
    private final PaperRepository paperRepository;
    private final PaperResponseService paperResponseService;

    public LibraryService(
            LibraryRepository libraryRepository,
            PaperRepository paperRepository,
            PaperResponseService paperResponseService
    ) {
        this.libraryRepository = libraryRepository;
        this.paperRepository = paperRepository;
        this.paperResponseService = paperResponseService;
    }

    public LibraryItemDTO add(UUID userId, UUID paperId) {
        return libraryRepository.findByUserIdAndPaper_Id(userId, paperId)
                .map(this::toDto)
                .orElseGet(() -> {
                    Paper paper = paperRepository.findById(paperId)
                            .orElseThrow(() -> new ResourceNotFoundException("Paper not found"));

                    LibraryItem item = new LibraryItem();
                    item.setUserId(userId);
                    item.setPaper(paper);
                    item.setCreatedAt(Instant.now());

                    LibraryItem saved = libraryRepository.save(item);
                    return toDto(saved, paper);
                });
    }

    @Transactional(readOnly = true)
    public boolean isInLibrary(UUID userId, UUID paperId) {
        return libraryRepository.existsByUserIdAndPaper_Id(userId, paperId);
    }

    @Transactional(readOnly = true)
    public Page<LibraryItemDTO> list(UUID userId, Pageable pageable) {
        return libraryRepository.findByUserId(userId, pageable)
                .map(this::toDto);
    }

    public void remove(UUID userId, UUID paperId) {
        libraryRepository.deleteByUserIdAndPaper_Id(userId, paperId);
    }

    private LibraryItemDTO toDto(LibraryItem item) {
        Paper paper = item.getPaper();
        return toDto(item, paper);
    }

    private LibraryItemDTO toDto(LibraryItem item, Paper paper) {
        PaperResponse paperResponse = paperResponseService.toPaperResponse(paper);
        return new LibraryItemDTO(
                item.getId(),
                paper.getId(),
                paperResponse.getTitle(),
                paperResponse.getAuthor(),
                paperResponse.getCategories(),
                paperResponse.getAbstractSnippet(),
                paperResponse.getUploadedAt(),
                paperResponse.getPublicationYear(),
                paperResponse.getViewCount(),
                paperResponse.getFilePath(),
                item.getCreatedAt()
        );
    }
}
