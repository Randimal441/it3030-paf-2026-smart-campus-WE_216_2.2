package com.smart_campus_operations_hub.hello_hub.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/technician")
public class TechnicianController {

    @PutMapping("/incidents")
    public ResponseEntity<Map<String, String>> updateIncidentStatus() {
        return ResponseEntity.ok(Map.of("message", "Technician incident updated"));
    }
}
