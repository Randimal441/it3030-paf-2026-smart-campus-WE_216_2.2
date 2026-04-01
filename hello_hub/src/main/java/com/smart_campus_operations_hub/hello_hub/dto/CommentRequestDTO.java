package com.smart_campus_operations_hub.hello_hub.dto;

import lombok.Data;

@Data
public class CommentRequestDTO {
    private String ticketId;
    private String message;
    
}
