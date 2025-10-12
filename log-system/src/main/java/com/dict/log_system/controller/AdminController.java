package com.dict.log_system.controller;

import com.dict.log_system.model.Admin;
import com.dict.log_system.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admins")
@CrossOrigin(origins = "*") // allows frontend or mobile apps to access the API
public class AdminController {

    @Autowired
    private AdminRepository adminRepository;

    // 🟢 CREATE Admin
    @PostMapping
    public Admin createAdmin(@RequestBody Admin admin) {
        return adminRepository.save(admin);
    }

    // 🟡 READ all Admins
    @GetMapping
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
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
            admin.setFirst_name(adminDetails.getFirst_name());
            admin.setMiddle_initial(adminDetails.getMiddle_initial());
            admin.setLast_name(adminDetails.getLast_name());
            admin.setBirthday(adminDetails.getBirthday());
            admin.setSex(adminDetails.getSex());
            admin.setEmail(adminDetails.getEmail());
            admin.setCp(adminDetails.getCp());
            admin.setPassword(adminDetails.getPassword());
            return adminRepository.save(admin);
        }
        return null;
    }

    // 🔴 DELETE Admin
    @DeleteMapping("/{id}")
    public String deleteAdmin(@PathVariable Long id) {
        adminRepository.deleteById(id);
        return "Admin with ID " + id + " deleted successfully!";
    }
}
