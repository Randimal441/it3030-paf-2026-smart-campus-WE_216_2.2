package com.smart_campus_operations_hub.hello_hub.service;

import com.smart_campus_operations_hub.hello_hub.dto.NotificationResponseDTO;
import com.smart_campus_operations_hub.hello_hub.model.NotificationType;

import java.util.List;

public interface NotificationService {
    void createNotificationForUser(
            String recipientEmail,
            NotificationType type,
            String title,
            String message,
            String relatedEntityId,
            String relatedEntityType,
            String actionUrl
    );

    void createNotificationForUsers(
            List<String> recipientEmails,
            NotificationType type,
            String title,
            String message,
            String relatedEntityId,
            String relatedEntityType,
            String actionUrl
    );

    List<NotificationResponseDTO> getNotificationsForUser(String recipientEmail);

    long getUnreadCountForUser(String recipientEmail);

    NotificationResponseDTO markAsRead(String notificationId, String recipientEmail);

    int markAllAsRead(String recipientEmail);

    void deleteNotification(String notificationId, String recipientEmail);
}
