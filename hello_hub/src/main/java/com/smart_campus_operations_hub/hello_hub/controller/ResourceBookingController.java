package com.smart_campus_operations_hub.hello_hub.controller;

import com.smart_campus_operations_hub.hello_hub.dto.ResourceBookingRequestDTO;
import com.smart_campus_operations_hub.hello_hub.dto.ResourceBookingResponseDTO;
import com.smart_campus_operations_hub.hello_hub.model.BookingStatus;
import com.smart_campus_operations_hub.hello_hub.service.ResourceBookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resource-bookings")
@RequiredArgsConstructor
public class ResourceBookingController {

    private final ResourceBookingService resourceBookingService;

    @PostMapping
    public ResponseEntity<ResourceBookingResponseDTO> createBooking(
            Authentication authentication,
            @Valid @RequestBody ResourceBookingRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resourceBookingService.createBooking(authentication, dto));
    }

    @GetMapping
    public ResponseEntity<List<ResourceBookingResponseDTO>> getAllBookings() {
        return ResponseEntity.ok(resourceBookingService.getAllBookings());
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<List<ResourceBookingResponseDTO>> getMyBookings(Authentication authentication) {
        return ResponseEntity.ok(resourceBookingService.getBookingsByRequester(authentication.getName()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ResourceBookingResponseDTO> updateBookingStatus(
            @PathVariable String id,
            @RequestParam BookingStatus status) {
        return ResponseEntity.ok(resourceBookingService.updateBookingStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable String id, Authentication authentication) {
        resourceBookingService.deleteBooking(id, authentication);
        return ResponseEntity.noContent().build();
    }
}
