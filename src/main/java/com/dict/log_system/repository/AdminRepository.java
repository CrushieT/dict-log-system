package com.dict.log_system.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.dict.log_system.model.Admin;

public interface AdminRepository extends JpaRepository<Admin, Long> {

    Optional<Admin> findByEmail(String email);
    boolean existsByEmail(String email);
}