package com.smart_campus_operations_hub.hello_hub.controller;

import com.smart_campus_operations_hub.hello_hub.dto.ResourceBookingRequestDTO;
import com.smart_campus_operations_hub.hello_hub.dto.ResourceBookingResponseDTO;
import com.smart_campus_operations_hub.hello_hub.service.ResourceBookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {

    private final ResourceBookingService resourceBookingService;

    @PostMapping("/bookings")
    public ResponseEntity<ResourceBookingResponseDTO> createBooking(Authentication authentication,
                                                                    @Valid @RequestBody ResourceBookingRequestDTO request) {
        ResourceBookingResponseDTO createdBooking = resourceBookingService.createBooking(authentication, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBooking);
    }

    @PostMapping("/incidents")
    public ResponseEntity<Map<String, String>> reportIncident() {
        return ResponseEntity.ok(Map.of("message", "Student incident reported"));
    }
}
