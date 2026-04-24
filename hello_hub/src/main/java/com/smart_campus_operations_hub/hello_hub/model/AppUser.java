package com.smart_campus_operations_hub.hello_hub.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class AppUser {

    @Id
    private String id;

    private String name;

    private String email;

    private UserRole role;

    private AuthProvider provider;

    private String passwordHash;

    private Boolean approved;

    private Instant createdAt;
}
