package com.smart_campus_operations_hub.hello_hub.repository;

import com.smart_campus_operations_hub.hello_hub.model.ResourceBooking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceBookingRepository extends JpaRepository<ResourceBooking, Long> {
}
