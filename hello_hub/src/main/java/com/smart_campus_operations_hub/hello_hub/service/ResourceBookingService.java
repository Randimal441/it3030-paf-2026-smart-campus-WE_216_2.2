package com.smart_campus_operations_hub.hello_hub.service;

import com.smart_campus_operations_hub.hello_hub.dto.ResourceBookingRequestDTO;
import com.smart_campus_operations_hub.hello_hub.dto.ResourceBookingResponseDTO;
import com.smart_campus_operations_hub.hello_hub.exception.BadRequestException;
import com.smart_campus_operations_hub.hello_hub.exception.ResourceNotFoundException;
import com.smart_campus_operations_hub.hello_hub.model.AppUser;
import com.smart_campus_operations_hub.hello_hub.model.BookingStatus;
import com.smart_campus_operations_hub.hello_hub.model.NotificationType;
import com.smart_campus_operations_hub.hello_hub.model.Resource;
import com.smart_campus_operations_hub.hello_hub.model.ResourceBooking;
import com.smart_campus_operations_hub.hello_hub.model.ResourceStatus;
import com.smart_campus_operations_hub.hello_hub.model.UserRole;
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
    private final UserService userService;
    private final NotificationService notificationService;

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

        List<String> adminEmails = userService.getUsersByRole(UserRole.ADMIN).stream()
            .map(AppUser::getEmail)
            .collect(Collectors.toList());

        notificationService.createNotificationForUsers(
            adminEmails,
            NotificationType.BOOKING_CREATED,
            "New Booking Request",
            booking.getRequesterEmail() + " requested " + booking.getResourceName(),
            String.valueOf(saved.getId()),
            "BOOKING",
            "/admin/bookings"
        );

        String requesterPath = resolveBookingPathForRequester(booking.getRequesterEmail());
        notificationService.createNotificationForUser(
            booking.getRequesterEmail(),
            NotificationType.BOOKING_CREATED,
            "Booking Submitted",
            "Your booking request for " + booking.getResourceName() + " is pending review.",
            String.valueOf(saved.getId()),
            "BOOKING",
            requesterPath
        );

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
        ResourceBooking saved = resourceBookingRepository.save(booking);

        NotificationType type = switch (status) {
            case APPROVED -> NotificationType.BOOKING_APPROVED;
            case REJECTED -> NotificationType.BOOKING_REJECTED;
            case CANCELLED -> NotificationType.BOOKING_CANCELLED;
            default -> NotificationType.BOOKING_CREATED;
        };

        String requesterPath = resolveBookingPathForRequester(saved.getRequesterEmail());
        notificationService.createNotificationForUser(
                saved.getRequesterEmail(),
                type,
                "Booking " + status.name(),
                "Your booking for " + saved.getResourceName() + " was marked as " + status.name() + ".",
                String.valueOf(saved.getId()),
                "BOOKING",
                requesterPath
        );

        return mapToResponse(saved);
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

        notificationService.createNotificationForUser(
            booking.getRequesterEmail(),
            NotificationType.BOOKING_CANCELLED,
            "Booking Cancelled",
            "Booking for " + booking.getResourceName() + " has been cancelled.",
            String.valueOf(booking.getId()),
            "BOOKING",
            resolveBookingPathForRequester(booking.getRequesterEmail())
        );

        List<String> adminEmails = userService.getUsersByRole(UserRole.ADMIN).stream()
            .map(AppUser::getEmail)
            .collect(Collectors.toList());

        notificationService.createNotificationForUsers(
            adminEmails,
            NotificationType.BOOKING_CANCELLED,
            "Booking Cancelled",
            booking.getRequesterEmail() + " cancelled booking for " + booking.getResourceName(),
            String.valueOf(booking.getId()),
            "BOOKING",
            "/admin/bookings"
        );
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

    private String resolveBookingPathForRequester(String requesterEmail) {
        AppUser requester = userService.getByEmail(requesterEmail);
        return requester.getRole() == UserRole.LECTURER ? "/lecturer/bookings" : "/student/bookings";
    }
}
