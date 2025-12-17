package com.dict.log_system.controller;

import com.dict.log_system.model.Admin;
import com.dict.log_system.model.Visitor;
import com.dict.log_system.repository.AdminRepository;
import com.dict.log_system.repository.VisitorRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.nio.file.Path;


@RestController
@RequestMapping("/api/superuser")
@CrossOrigin(origins = "*") // allows frontend or mobile apps to access the API
public class SuperUserController {

    
    @Autowired
    private VisitorRepository visitorRepository;

    @Autowired
    private AdminRepository adminRepository;
    
    private static final String EXPORT_DIR = "C:/dict_log/excel";

    
    @Value("${METABASE_URL}")
    private String metabaseUrl;

    @GetMapping("/metabase-url")
    public Map<String, String> getMetabaseUrl() {
        return Map.of("url", metabaseUrl);
    }

    @GetMapping("/admin-list")
    public List<Admin> getAllAdmins() {
        return adminRepository.findByRole("ADMIN");
    }

    @GetMapping("/visitor")
    public List<Visitor> getAllVisitors() {
        return visitorRepository.findAll();
    }

    @DeleteMapping("/visitor/{id}")
    public ResponseEntity<String> deleteVisitor(@PathVariable Long id) {
        return visitorRepository.findById(id).map(visitor -> {
            // Delete the image file
            String photoPath = visitor.getPhoto(); // assuming you stored the file name only
            if (photoPath != null && !photoPath.isEmpty()) {
                Path file = Paths.get("C:/dict_log/images/").resolve(photoPath);
                try {
                    Files.deleteIfExists(file);
                } catch (IOException e) {
                    e.printStackTrace();
                    // Log error but continue deleting the DB record
                }
            }

            // Delete visitor record from database
            visitorRepository.deleteById(id);
            return ResponseEntity.ok("Visitor deleted successfully");
        }).orElse(ResponseEntity.status(404).body("Visitor not found"));
    }

    @GetMapping("/visitors-count")
    public long getVisitorCount() {
        return visitorRepository.count();
    }

    @GetMapping("visitors-first-1000")
    public List<Visitor> getFirst1000Visitors() {
        return visitorRepository.findTop1000ByOrderByTimestampAsc();
    }

     @PostMapping("/exportExcel")
    public ResponseEntity<String> uploadExcel(@RequestParam("file") MultipartFile file) {
        try {
            // Ensure export folder exists
            Path dirPath = Paths.get(EXPORT_DIR);
            Files.createDirectories(dirPath);

            // Save the uploaded Excel file
            Path filePath = dirPath.resolve(file.getOriginalFilename());
            file.transferTo(filePath.toFile());

            System.out.println("Excel file saved at: " + filePath.toAbsolutePath());

            // Fetch first 1000 visitors
            List<Visitor> first1000 = visitorRepository.findTop1000ByOrderByTimestampAsc();

            if (!first1000.isEmpty()) {

                // Delete image files first
                for (Visitor visitor : first1000) {
                    String photoPath = visitor.getPhoto();

                    if (photoPath != null && !photoPath.isBlank()) {
                        Path imageFile = Paths.get("C:/dict_log/images/").resolve(photoPath);
                        try {
                            Files.deleteIfExists(imageFile);
                            System.out.println("Deleted image: " + imageFile);
                        } catch (IOException e) {
                            // Do NOT stop the process if one image fails
                            System.err.println("Failed to delete image: " + imageFile);
                            e.printStackTrace();
                        }
                    }
                }

                // Delete visitors from database
                visitorRepository.deleteAll(first1000);
                System.out.println("Deleted first 1000 visitors and their images.");
            }

            return ResponseEntity.ok(
                "Excel uploaded. First 1000 visitors and images deleted successfully."
            );

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body("Failed to save Excel or delete visitor data.");
        }
    }

}
