package com.researchhub.backend.controller;

import com.researchhub.backend.model.Paper;
import com.researchhub.backend.service.PaperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/papers")
@CrossOrigin(origins = "*")
public class PaperController {

    @Autowired
    private PaperService paperService;

    @PostMapping("/upload")
    public ResponseEntity<Paper> uploadPaper(@RequestParam("file") MultipartFile file,
                                             @RequestParam(value = "title", required = false) String title,
                                             @RequestParam(value = "author", required = false) String author) throws IOException {
        Paper saved = paperService.uploadPaper(file, title, author);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaper(@PathVariable("id") UUID id) throws IOException {
        paperService.deletePaper(id);
        return ResponseEntity.noContent().build();
    }
}


