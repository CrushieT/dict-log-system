package com.dict.log_system.controller;


import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.dict.log_system.model.Visitor;
import com.dict.log_system.repository.VisitorRepository;


@RestController
@RequestMapping("/visitors")
public class VisitorController {

    private final VisitorRepository visitorRepository;

    public VisitorController(VisitorRepository visitorRepository){
        this.visitorRepository = visitorRepository;
    }

    @GetMapping
    public List<Visitor> getAllVisitors() {
        return visitorRepository.findAll();
    }
    
    @PostMapping
    public Visitor addVisitor(@RequestBody Visitor visitor) {
        return visitorRepository.save(visitor);
    }
}

