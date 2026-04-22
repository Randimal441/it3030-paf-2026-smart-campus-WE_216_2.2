package com.smart_campus_operations_hub.hello_hub.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.smart_campus_operations_hub.hello_hub.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponseDTO {
    private String id;
    private NotificationType type;
    private String title;
    private String message;
    private String relatedEntityId;
    private String relatedEntityType;
    private String actionUrl;
    @JsonProperty("isRead")
    private boolean isRead;
    private LocalDateTime createdAt;
}
