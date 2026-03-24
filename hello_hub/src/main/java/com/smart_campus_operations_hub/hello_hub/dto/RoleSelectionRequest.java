package com.smart_campus_operations_hub.hello_hub.dto;

import com.smart_campus_operations_hub.hello_hub.model.UserRole;
import jakarta.validation.constraints.NotNull;

public record RoleSelectionRequest(@NotNull UserRole role) {
}
