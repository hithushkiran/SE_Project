package com.researchhub.backend.controller;

import com.researchhub.backend.model.Paper;
import com.researchhub.backend.service.PaperResponseService;
import com.researchhub.backend.service.PaperSearchService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ExploreController.class)
@Import(PaperResponseService.class)
class ExploreControllerTrendingTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PaperSearchService paperSearchService;

    @Test
    void trendingEndpointReturnsPapersSortedByViewCountDescending() throws Exception {
        Paper first = createPaper("Paper High", 30L);
        Paper second = createPaper("Paper Mid", 20L);
        Page<Paper> page = new PageImpl<>(List.of(first, second), PageRequest.of(1, 2), 4);

        when(paperSearchService.getTrendingPapers(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(
                        get("/api/explore/trending")
                                .param("page", "1")
                                .param("size", "2")
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].viewCount").value(30))
                .andExpect(jsonPath("$.data.content[1].viewCount").value(20))
                .andExpect(jsonPath("$.data.number").value(1))
                .andExpect(jsonPath("$.data.size").value(2));

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(paperSearchService).getTrendingPapers(pageableCaptor.capture());
        Pageable pageable = pageableCaptor.getValue();
        assertThat(pageable.getPageNumber()).isEqualTo(1);
        assertThat(pageable.getPageSize()).isEqualTo(2);
        assertThat(pageable.getSort()).isEqualTo(Sort.by(Sort.Direction.DESC, "viewCount"));
    }

    private Paper createPaper(String title, Long viewCount) {
        Paper paper = new Paper();
        paper.setId(UUID.randomUUID());
        paper.setTitle(title);
        paper.setAuthor("Test Author");
        paper.setAbstractText("Example abstract for " + title);
        paper.setUploadedAt(LocalDateTime.now());
        paper.setFilePath("uploads/" + title.replace(" ", "_") + ".pdf");
        paper.setViewCount(viewCount);
        paper.setPublicationYear(2024);
        return paper;
    }
}
