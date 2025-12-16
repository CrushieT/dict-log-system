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
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*") // allows frontend or mobile apps to access the API
public class AdminController {

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

    // 🟢 CREATE Admin
    @PostMapping
    public Admin createAdmin(@RequestBody Admin admin) {
        return adminRepository.save(admin);
    }

    @GetMapping("/admin-list")
    public List<Admin> getAllAdmins() {
        return adminRepository.findByRole("ADMIN");
    }

    @GetMapping("/visitor")
    public List<Visitor> getAllVisitors() {
        return visitorRepository.findAll();
    }

    // 🟠 READ one Admin by ID
    @GetMapping("/{id}")
    public Admin getAdminById(@PathVariable Long id) {
        return adminRepository.findById(id).orElse(null);
    }

    // 🔵 UPDATE Admin
    @PutMapping("/{id}")
    public Admin updateAdmin(@PathVariable Long id, @RequestBody Admin adminDetails) {
        Admin admin = adminRepository.findById(id).orElse(null);
        if (admin != null) {
            admin.setFirstName(adminDetails.getFirstName());
            admin.setMiddleInitial(adminDetails.getMiddleInitial());
            admin.setLastName(adminDetails.getLastName());
            admin.setBirthday(adminDetails.getBirthday());
            admin.setSex(adminDetails.getSex());
            admin.setEmail(adminDetails.getEmail());
            admin.setCp(adminDetails.getCp());
            admin.setPassword(adminDetails.getPassword());
            return adminRepository.save(admin);
        }
        return null;
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

            // Delete them safely
            if (!first1000.isEmpty()) {
                visitorRepository.deleteAll(first1000);
                System.out.println("Deleted first 1000 visitors after Excel export.");
            }

            return ResponseEntity.ok("Excel uploaded and first 1000 visitors deleted successfully.");
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to save Excel file.");
        }
    }

}
