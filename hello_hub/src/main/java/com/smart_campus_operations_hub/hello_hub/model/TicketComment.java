package com.smart_campus_operations_hub.hello_hub.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "comments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketComment {
    @Id
    private String id;

    private String ticketId; // Link to Ticket

    private String commenterEmail;
    private String commenterName;
    private String commenterRole; // STUDENT, LECTURER, ADMIN, TECHNICIAN

    private String message;

    private LocalDateTime createdAt;

}
