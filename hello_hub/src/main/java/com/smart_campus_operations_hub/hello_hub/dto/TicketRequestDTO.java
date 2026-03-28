package com.smart_campus_operations_hub.hello_hub.dto;

import java.util.List;

import lombok.Data;

@Data
public class TicketRequestDTO {
    private String title;
    private String description;
    private String category;
    private String priority;
    private String location;
    private String contact;
    private String role;

    private List<String> imageUrls; 
}
