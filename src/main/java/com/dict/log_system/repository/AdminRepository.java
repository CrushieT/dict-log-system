package com.dict.log_system.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.dict.log_system.model.Admin;

public interface AdminRepository extends JpaRepository<Admin, Long> {

    Optional<Admin> findByEmail(String email);
    List<Admin> findByRole(String role);
    boolean existsByEmail(String email);
    long countByRole(String role);
}