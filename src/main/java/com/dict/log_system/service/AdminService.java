package com.dict.log_system.service;

import com.dict.log_system.model.Admin;
import com.dict.log_system.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AdminService {
    private final AdminRepository repo;
    private final PasswordEncoder encoder;
    private final JavaMailSender mailSender;
    
    // temporary storage: email -> Admin (not yet verified)
    private final Map<String, PendingRegistration> pending = new ConcurrentHashMap<>();
    
    
    @Value("${spring.mail.username}")
    private String sender;

    @Value("${server.port}")
    private int serverPort;

    public AdminService(AdminRepository repo, PasswordEncoder encoder, JavaMailSender mailSender) {
        this.repo = repo;
        this.encoder = encoder;
        this.mailSender = mailSender;
    }

    
    private static class PendingRegistration {
        Admin admin;
        String otp;
        LocalDateTime expiresAt;

        PendingRegistration(Admin admin, String otp) {
            this.admin = admin;
            this.otp = otp;
            this.expiresAt = LocalDateTime.now().plusMinutes(5); // OTP valid for 5 mins
        }

        boolean isExpired() {
            return LocalDateTime.now().isAfter(expiresAt);
        }
    }

    
    public boolean registerUser(Admin admin) {

        // Prevent duplicate emails
        if (repo.existsByEmail(admin.getEmail())) {
            System.out.println("❌ Email already exists in DB: " + admin.getEmail());
            return false;
        }

        // 🚫 Prevent more than 2 admins
        if ("admin".equalsIgnoreCase(admin.getRole())) {
            long adminCount = repo.countByRole("admin");
            if (adminCount >= 2) {
                System.out.println("❌ Admin limit reached. Only 2 admins allowed.");
                throw new IllegalStateException("Only 2 admin accounts are allowed.");
            }
        }

        System.out.println("Name Check: " + admin.getFirstName()+admin.getMiddleInitial()+admin.getLastName());

        // Check for pending OTP
        PendingRegistration existing = pending.get(admin.getEmail());
        if (existing != null && !existing.isExpired()) {
            System.out.println("⚠️ Pending OTP still active for: " + admin.getEmail());
            return false;
        }

        // Generate OTP
        String otp = String.format("%04d", new Random().nextInt(10000));
        pending.put(admin.getEmail(), new PendingRegistration(admin, otp));
        sendOtpEmail(admin.getEmail(), otp);

        System.out.println("📧 OTP sent to " + admin.getEmail() + ": " + otp);
        return true;
    }


    
    public boolean verifyOtp(String email, String otp) {
        PendingRegistration pendingReg = pending.get(email);

        if (pendingReg == null) {
            System.out.println("❌ No pending registration found for: " + email);
            return false;
        }

        if (pendingReg.isExpired()) {
            pending.remove(email);
            System.out.println("⌛ OTP expired for: " + email);
            return false;
        }

        if (pendingReg.otp.equals(otp)) {
            Admin admin = pendingReg.admin;
            admin.setPassword(encoder.encode(admin.getPassword()));
            admin.setVerified(true);
            repo.save(admin);
            pending.remove(email);
            System.out.println("✅ Account verified and saved for: " + email);
            return true;
        }

        System.out.println("❌ Invalid OTP for: " + email);
        return false;
    }

    private void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your Verification Code");
        message.setText("Your 4-digit OTP code is: " + otp + "\n\nThis code will expire in 5 minutes.");
        mailSender.send(message);
    }
}
