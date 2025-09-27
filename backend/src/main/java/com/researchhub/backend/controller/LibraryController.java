package com.researchhub.backend.controller;

import com.researchhub.backend.model.Paper;
import com.researchhub.backend.service.LibraryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class LibraryController {

    @Autowired
    private LibraryService libraryService;

    @PostMapping("/library/add/{paperId}")
    public ResponseEntity<Void> addToLibrary(@RequestParam("userId") UUID userId,
                                             @PathVariable("paperId") UUID paperId) {
        libraryService.addToLibrary(userId, paperId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/library/remove/{paperId}")
    public ResponseEntity<Void> removeFromLibrary(@RequestParam("userId") UUID userId,
                                                  @PathVariable("paperId") UUID paperId) {
        libraryService.removeFromLibrary(userId, paperId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/{id}/library")
    public ResponseEntity<List<Paper>> getUserLibrary(@PathVariable("id") UUID userId) {
        return ResponseEntity.ok(libraryService.getUserLibrary(userId));
    }
}


