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
