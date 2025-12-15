package com.dict.log_system.controller;

import com.dict.log_system.model.Admin;
import com.dict.log_system.repository.AdminRepository;
import com.dict.log_system.service.AdminService;

import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;


@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // allow JS frontend
public class AuthController {

    private final AdminService service;
    private final AuthenticationManager authenticationManager;
    @Autowired
    private AdminRepository adminRepository;

    public AuthController(AdminService service, AuthenticationManager authenticationManager) {
        this.service = service;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/register")
    public String register(@RequestBody Admin admin) {
        boolean success = service.registerUser(admin);
        return success ? "OTP sent to your email!" : "Email already exists!";
    }

    @PostMapping("/verify")
    public String verify(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");

        boolean verified = service.verifyOtp(email, otp);
        return verified ? "Account verified!" : "Invalid OTP!";
    }

   @PostMapping("/login")
    public ResponseEntity<String> login(HttpServletRequest request, @RequestBody Admin admin) {
        try {
            Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(admin.getEmail(), admin.getPassword())
            );

            // ✅ Store authentication in session
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(auth);
            SecurityContextHolder.setContext(context);
            request.getSession(true)
                .setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

            // ✅ Check user role
            boolean isSuper = auth.getAuthorities().stream()
                    .anyMatch(r -> r.getAuthority().equals("ROLE_SUPERUSER"));

            if (isSuper) {
                return ResponseEntity.ok("LOGIN_SUCCESS_SUPERUSER");
            } else {
                return ResponseEntity.ok("LOGIN_SUCCESS_ADMIN");
            }

        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("LOGIN_FAILED");
        }
    }

    
    @GetMapping("/check-admin-count")
    public boolean checkAdminCount() {
        long adminCount = adminRepository.countByRole("ADMIN");
        // Return true if less than 2 admins exist, otherwise false
        return adminCount < 2;
    }


    

}
