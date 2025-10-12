package com.dict.log_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.dict.log_system.model.Visitor;

public interface VisitorRepository extends JpaRepository<Visitor, Long> {

}