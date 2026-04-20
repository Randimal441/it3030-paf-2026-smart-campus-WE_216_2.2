package com.smart_campus_operations_hub.hello_hub.service;

import com.smart_campus_operations_hub.hello_hub.dto.ResourceBookingRequestDTO;
import com.smart_campus_operations_hub.hello_hub.dto.ResourceBookingResponseDTO;
import com.smart_campus_operations_hub.hello_hub.exception.BadRequestException;
import com.smart_campus_operations_hub.hello_hub.exception.ResourceNotFoundException;
import com.smart_campus_operations_hub.hello_hub.model.BookingStatus;
import com.smart_campus_operations_hub.hello_hub.model.Resource;
import com.smart_campus_operations_hub.hello_hub.model.ResourceBooking;
import com.smart_campus_operations_hub.hello_hub.model.ResourceStatus;
import com.smart_campus_operations_hub.hello_hub.repository.ResourceBookingRepository;
import com.smart_campus_operations_hub.hello_hub.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceBookingService {

    private final ResourceRepository resourceRepository;
    private final ResourceBookingRepository resourceBookingRepository;

    public ResourceBookingResponseDTO createBooking(Authentication authentication, ResourceBookingRequestDTO dto) {
        Resource resource = resourceRepository.findById(dto.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + dto.getResourceId()));

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new BadRequestException("Only ACTIVE resources can be booked.");
        }

        if (!dto.getStartTime().isBefore(dto.getEndTime())) {
            throw new BadRequestException("Start time must be before end time.");
        }

        if (dto.getStartTime().isBefore(resource.getAvailabilityStartTime())
                || dto.getEndTime().isAfter(resource.getAvailabilityEndTime())) {
            throw new BadRequestException("Requested time is outside resource availability window.");
        }

        ResourceBooking booking = ResourceBooking.builder()
                .resourceId(resource.getId())
                .resourceName(resource.getName())
                .requesterEmail(authentication.getName())
                .requesterRole(authentication.getAuthorities().stream()
                        .findFirst()
                        .map(a -> a.getAuthority())
                        .orElse("ROLE_STUDENT"))
                .bookingDate(dto.getBookingDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .purpose(dto.getPurpose().trim())
                .attendees(dto.getAttendees())
                .status(BookingStatus.PENDING)
                .build();

        ResourceBooking saved = resourceBookingRepository.save(booking);
        return mapToResponse(saved);
    }

    public List<ResourceBookingResponseDTO> getAllBookings() {
        return resourceBookingRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ResourceBookingResponseDTO> getBookingsByRequester(String email) {
        return resourceBookingRepository.findByRequesterEmail(email).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ResourceBookingResponseDTO updateBookingStatus(Long id, BookingStatus status) {
        ResourceBooking booking = resourceBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
        booking.setStatus(status);
        return mapToResponse(resourceBookingRepository.save(booking));
    }

    public void deleteBooking(Long id, Authentication authentication) {
        ResourceBooking booking = resourceBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
        
        // Only the requester or an admin can delete/cancel a booking
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        if (!isAdmin && !booking.getRequesterEmail().equals(authentication.getName())) {
            throw new BadRequestException("You are not authorized to cancel this booking.");
        }

        resourceBookingRepository.delete(booking);
    }

    private ResourceBookingResponseDTO mapToResponse(ResourceBooking booking) {
        return ResourceBookingResponseDTO.builder()
                .id(booking.getId())
                .resourceId(booking.getResourceId())
                .resourceName(booking.getResourceName())
                .requesterEmail(booking.getRequesterEmail())
                .requesterRole(booking.getRequesterRole())
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .attendees(booking.getAttendees())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
