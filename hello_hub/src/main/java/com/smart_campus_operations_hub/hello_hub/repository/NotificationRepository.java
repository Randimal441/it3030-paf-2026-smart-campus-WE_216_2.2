package com.smart_campus_operations_hub.hello_hub.repository;

import com.smart_campus_operations_hub.hello_hub.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);
    List<Notification> findByRecipientEmailAndIsReadFalse(String recipientEmail);
    long countByRecipientEmailAndIsReadFalse(String recipientEmail);
    Optional<Notification> findByIdAndRecipientEmail(String id, String recipientEmail);
    void deleteByRecipientEmailAndCreatedAtBefore(String recipientEmail, LocalDateTime createdAt);
}
