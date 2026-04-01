package com.smart_campus_operations_hub.hello_hub.model;

import java.time.LocalDateTime;
import java.util.List;

import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;

import org.springframework.data.annotation.Id;

@Document(collection = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {
    @Id
    private String id; // MongoDB ObjectId (auto-generated)

    private String title;
    private String description;
    private String category;
    private String priority;
    private List<String> imageUrls;

    private String status;

    private String location;
    private String contact;

    private String role;

    private String createdByName;
    private String createdByEmail;

    private LocalDateTime createdAt;

    private String assignedTechnicianEmail;
    private String assignedTechnicianName;

    private String rejectionReason;

    private String resolutionNote;

    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.status = "OPEN";
    }
}
