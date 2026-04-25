package com.smart_campus_operations_hub.hello_hub.service;

import com.smart_campus_operations_hub.hello_hub.dto.NotificationResponseDTO;
import com.smart_campus_operations_hub.hello_hub.model.AppUser;
import com.smart_campus_operations_hub.hello_hub.model.Notification;
import com.smart_campus_operations_hub.hello_hub.model.NotificationType;
import com.smart_campus_operations_hub.hello_hub.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    @Override
    public void createNotificationForUser(
            String recipientEmail,
            NotificationType type,
            String title,
            String message,
            String relatedEntityId,
            String relatedEntityType,
            String actionUrl) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            return;
        }
        String normalizedEmail = recipientEmail.trim();
        AppUser recipient = null;
        try {
            recipient = userService.getByEmail(normalizedEmail);
        } catch (RuntimeException ex) {
            log.warn("Saving notification without user lookup for {} due to: {}", normalizedEmail, ex.getMessage());
        }

        LocalDateTime now = LocalDateTime.now();
        Notification notification = Notification.builder()
                .recipientEmail(normalizedEmail)
                .recipientRole(recipient != null ? recipient.getRole() : null)
                .type(type)
                .title(title)
                .message(message)
                .relatedEntityId(relatedEntityId)
                .relatedEntityType(relatedEntityType)
                .actionUrl(actionUrl)
                .isRead(false)
                .createdAt(now)
                .updatedAt(now)
                .build();

        notificationRepository.save(notification);
    }

    @Override
    public void createNotificationForUsers(
            List<String> recipientEmails,
            NotificationType type,
            String title,
            String message,
            String relatedEntityId,
            String relatedEntityType,
            String actionUrl) {
        if (recipientEmails == null || recipientEmails.isEmpty()) {
            return;
        }

        Set<String> uniqueEmails = new LinkedHashSet<>(recipientEmails);
        for (String email : uniqueEmails) {
            createNotificationForUser(
                    email,
                    type,
                    title,
                    message,
                    relatedEntityId,
                    relatedEntityType,
                    actionUrl);
        }
    }

    @Override
    public List<NotificationResponseDTO> getNotificationsForUser(String recipientEmail) {
        List<Notification> notifications = notificationRepository
                .findByRecipientEmailOrderByCreatedAtDesc(recipientEmail);

        List<NotificationResponseDTO> response = new ArrayList<>();
        for (Notification notification : notifications) {
            response.add(toDto(notification));
        }
        return response;
    }

    @Override
    public long getUnreadCountForUser(String recipientEmail) {
        return notificationRepository.countByRecipientEmailAndIsReadFalse(recipientEmail);
    }

    @Override
    public NotificationResponseDTO markAsRead(String notificationId, String recipientEmail) {
        Notification notification = notificationRepository.findByIdAndRecipientEmail(notificationId, recipientEmail)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setUpdatedAt(LocalDateTime.now());
            notification = notificationRepository.save(notification);
        }

        return toDto(notification);
    }

    @Override
    public int markAllAsRead(String recipientEmail) {
        List<Notification> unread = notificationRepository.findByRecipientEmailAndIsReadFalse(recipientEmail);
        if (unread.isEmpty()) {
            return 0;
        }

        LocalDateTime now = LocalDateTime.now();
        for (Notification notification : unread) {
            notification.setRead(true);
            notification.setUpdatedAt(now);
        }

        notificationRepository.saveAll(unread);
        return unread.size();
    }

    @Override
    public void deleteNotification(String notificationId, String recipientEmail) {
        Notification notification = notificationRepository.findByIdAndRecipientEmail(notificationId, recipientEmail)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notificationRepository.delete(notification);
    }

    private NotificationResponseDTO toDto(Notification notification) {
        return NotificationResponseDTO.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .relatedEntityId(notification.getRelatedEntityId())
                .relatedEntityType(notification.getRelatedEntityType())
                .actionUrl(notification.getActionUrl())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
