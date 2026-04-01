package com.smart_campus_operations_hub.hello_hub.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

@Data
public class TicketResponseDTO {
    private String id;
    private String title;
    private String description;
    private String category;
    private String priority;
    private String status;
    private String location;
    private String contact;
    private String role;
    private String createdByName;
    private String createdByEmail;
    private LocalDateTime createdAt;
    private List<String> imageUrls;
    private String assignedTechnicianEmail;
    private String assignedTechnicianName;
    private String rejectionReason;
    private String resolutionNote;

}
