package com.smart_campus_operations_hub.hello_hub.dto;

import com.smart_campus_operations_hub.hello_hub.model.ResourceStatus;
import com.smart_campus_operations_hub.hello_hub.model.ResourceType;
import java.time.LocalDateTime;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponseDTO {

    private Long id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private LocalTime availabilityStartTime;
    private LocalTime availabilityEndTime;
    private ResourceStatus status;
    private LocalDateTime createdAt;
}
