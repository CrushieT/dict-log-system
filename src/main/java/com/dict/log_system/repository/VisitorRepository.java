package com.dict.log_system.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.dict.log_system.model.Visitor;

public interface VisitorRepository extends JpaRepository<Visitor, Long> {
    // Count total entries
    long countBy();

    // Fetch top N entries (optional)
    List<Visitor> findTop1000ByOrderByTimestampAsc();
}