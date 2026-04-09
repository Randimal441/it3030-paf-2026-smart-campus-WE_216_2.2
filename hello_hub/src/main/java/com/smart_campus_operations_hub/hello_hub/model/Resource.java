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
@Document(collection = "resources")
public class Resource {

    @Id
    private Long id;

    private String name;

    private ResourceType type;

    private Integer capacity;

    private String location;

    private LocalDate resourceDate;

    private LocalTime availabilityStartTime;

    private LocalTime availabilityEndTime;

    private ResourceStatus status;

    private LocalDateTime createdAt;
}
