package com.smart_campus_operations_hub.hello_hub.repository;

import com.smart_campus_operations_hub.hello_hub.model.BookingStatus;
import com.smart_campus_operations_hub.hello_hub.model.ResourceBooking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ResourceBookingRepository extends MongoRepository<ResourceBooking, String> {
       List<ResourceBooking> findByRequesterEmail(String requesterEmail);

       List<ResourceBooking> findByStatus(BookingStatus status);

       @Query("{'resourceId': ?0, 'bookingDate': ?1, 'status': 'APPROVED', '$or': [{'startTime': {'$lt': ?3}, 'endTime': {'$gt': ?2}}]}")
       List<ResourceBooking> findOverlappingBookings(
                     Long resourceId,
                     LocalDate date,
                     LocalTime start,
                     LocalTime end);
}
