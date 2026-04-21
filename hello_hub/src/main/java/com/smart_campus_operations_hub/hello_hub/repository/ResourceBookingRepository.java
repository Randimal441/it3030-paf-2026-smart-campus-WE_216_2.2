package com.smart_campus_operations_hub.hello_hub.repository;

import com.smart_campus_operations_hub.hello_hub.model.BookingStatus;
import com.smart_campus_operations_hub.hello_hub.model.ResourceBooking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResourceBookingRepository extends JpaRepository<ResourceBooking, Long> {
    List<ResourceBooking> findByRequesterEmail(String requesterEmail);
    List<ResourceBooking> findByStatus(BookingStatus status);
}
