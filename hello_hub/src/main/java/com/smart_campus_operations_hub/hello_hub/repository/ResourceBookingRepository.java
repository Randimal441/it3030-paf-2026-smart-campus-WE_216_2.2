package com.smart_campus_operations_hub.hello_hub.repository;

import com.smart_campus_operations_hub.hello_hub.model.BookingStatus;
import com.smart_campus_operations_hub.hello_hub.model.ResourceBooking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ResourceBookingRepository extends JpaRepository<ResourceBooking, Long> {
    List<ResourceBooking> findByRequesterEmail(String requesterEmail);
    List<ResourceBooking> findByStatus(BookingStatus status);

    @Query("SELECT b FROM ResourceBooking b " +
           "WHERE b.resourceId = :resourceId " +
           "AND b.bookingDate = :date " +
           "AND b.status = 'APPROVED' " +
           "AND ((b.startTime < :end AND b.endTime > :start))")
    List<ResourceBooking> findOverlappingBookings(
            @Param("resourceId") Long resourceId,
            @Param("date") LocalDate date,
            @Param("start") LocalTime start,
            @Param("end") LocalTime end);
}
