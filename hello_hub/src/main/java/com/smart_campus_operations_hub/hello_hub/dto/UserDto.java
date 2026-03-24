package com.smart_campus_operations_hub.hello_hub.dto;

import com.smart_campus_operations_hub.hello_hub.model.AuthProvider;
import com.smart_campus_operations_hub.hello_hub.model.UserRole;
import lombok.Builder;

import java.time.Instant;

@Builder
public record UserDto(
        String id,
        String name,
        String email,
        UserRole role,
        AuthProvider provider,
        Instant createdAt
) {
}
