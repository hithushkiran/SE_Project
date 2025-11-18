package com.researchhub.backend.service;

import com.researchhub.backend.model.Paper;
import com.researchhub.backend.model.User;
import com.researchhub.backend.repository.PaperRepository;
import com.researchhub.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LibraryServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PaperRepository paperRepository;

    @InjectMocks
    private LibraryService libraryService;

    @Test
    void addToLibraryIsIdempotentForExistingPaper() {
        UUID userId = UUID.randomUUID();
        UUID paperId = UUID.randomUUID();

        User user = new User();
        user.setId(userId);
        Paper paper = new Paper();
        paper.setId(paperId);

        when(userRepository.findByIdWithLibrary(userId)).thenReturn(Optional.of(user));
        when(paperRepository.findById(paperId)).thenReturn(Optional.of(paper));

        boolean firstAttempt = libraryService.addToLibrary(userId, paperId);

        assertThat(firstAttempt).isTrue();
        verify(userRepository).save(user);

        clearInvocations(userRepository);

        boolean secondAttempt = libraryService.addToLibrary(userId, paperId);

        assertThat(secondAttempt).isFalse();
        verify(userRepository, never()).save(any(User.class));
    }
}
