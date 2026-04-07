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
