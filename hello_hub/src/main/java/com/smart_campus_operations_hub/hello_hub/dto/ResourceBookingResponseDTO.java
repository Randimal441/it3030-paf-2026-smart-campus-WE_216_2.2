package com.smart_campus_operations_hub.hello_hub.dto;

import com.smart_campus_operations_hub.hello_hub.model.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceBookingResponseDTO {

    private String id;
    private Long resourceId;
    private String resourceName;
    private String requesterEmail;
    private String requesterRole;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer attendees;
    private BookingStatus status;
    private LocalDateTime createdAt;
}
