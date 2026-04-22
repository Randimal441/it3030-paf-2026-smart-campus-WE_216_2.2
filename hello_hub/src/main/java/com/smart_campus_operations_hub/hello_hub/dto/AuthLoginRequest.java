package com.smart_campus_operations_hub.hello_hub.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthLoginRequest(
        @Email @NotBlank String email,
        @NotBlank @Size(min = 6, max = 72) String password
) {
}