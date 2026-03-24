package com.smart_campus_operations_hub.hello_hub.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    @PostMapping("/bookings")
    public ResponseEntity<Map<String, String>> createBooking() {
        return ResponseEntity.ok(Map.of("message", "Student booking created"));
    }

    @PostMapping("/incidents")
    public ResponseEntity<Map<String, String>> reportIncident() {
        return ResponseEntity.ok(Map.of("message", "Student incident reported"));
    }
}
