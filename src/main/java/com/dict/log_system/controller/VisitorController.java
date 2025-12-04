package com.dict.log_system.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import com.dict.log_system.model.Visitor;
import com.dict.log_system.repository.VisitorRepository;
import java.nio.file.Path;


@RestController
@RequestMapping("/api")
public class VisitorController {

    private final VisitorRepository visitorRepository;
    private static final String IMAGE_DIR = "C:/dict_log/images/";

    public VisitorController(VisitorRepository visitorRepository){
        this.visitorRepository = visitorRepository;
    }

    @GetMapping("/visitor")
    public List<Visitor> getAllVisitors() {
        return visitorRepository.findAll();
    }




    @PostMapping("/visitor")
    public ResponseEntity<String> saveVisitor(
        @RequestParam String firstName,
        @RequestParam String mi,
        @RequestParam String lastName,
        @RequestParam String purpose,
        @RequestParam("imageFile") MultipartFile imageFile
    ) {
    try {
        // Ensure images folder exists
        Path dirPath = Paths.get(IMAGE_DIR);
        Files.createDirectories(dirPath);

        // Manila timestamp
        ZoneId manilaZone = ZoneId.of("Asia/Manila");
        LocalDateTime manilaTime = LocalDateTime.now(manilaZone);

        // Generate filename
        String timestampForFile = manilaTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"));
        String filename = firstName + "_" + lastName + "_" + timestampForFile + ".png";

        // Full file path
        Path filePath = dirPath.resolve(filename);

        // Save image to disk
        imageFile.transferTo(filePath.toFile());

        // Save visitor details to DB
        Visitor visitor = new Visitor();
        visitor.setFirst_name(firstName);
        visitor.setMiddle_initial(mi);
        visitor.setLast_name(lastName);
        visitor.setPurpose(purpose);
        visitor.setPhoto(filename);   // ✅ save ONLY the filename
        visitor.setTimestamp(manilaTime);

        visitorRepository.save(visitor);

        return ResponseEntity.ok("Visitor saved successfully");

    } catch (IOException e) {
        e.printStackTrace();
        return ResponseEntity.status(500).body("Failed to save visitor");
    }
    }

}

