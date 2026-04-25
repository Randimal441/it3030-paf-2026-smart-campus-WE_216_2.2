package com.smart_campus_operations_hub.hello_hub.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resource_bookings")
public class ResourceBooking {

    @Id
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

    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
