package com.dict.log_system.controller;

import com.dict.log_system.model.Admin;
import com.dict.log_system.model.Visitor;
import com.dict.log_system.repository.AdminRepository;
import com.dict.log_system.repository.VisitorRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
