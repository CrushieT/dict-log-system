package com.dict.log_system.controller;

import com.dict.log_system.model.Admin;
import com.dict.log_system.model.Visitor;
import com.dict.log_system.repository.AdminRepository;
import com.dict.log_system.repository.VisitorRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.nio.file.Path;


@RestController
@RequestMapping("/api/superuser")
@CrossOrigin(origins = "*") // allows frontend or mobile apps to access the API
public class SuperUserController {

    
    @Autowired
    private VisitorRepository visitorRepository;

    @Autowired
    private AdminRepository adminRepository;

    

    @GetMapping("/admin-list")
    public List<Admin> getAllAdmins() {
        return adminRepository.findByRole("ADMIN");
    }

    @GetMapping("/visitor")
    public List<Visitor> getAllVisitors() {
        return visitorRepository.findAll();
    }
}
