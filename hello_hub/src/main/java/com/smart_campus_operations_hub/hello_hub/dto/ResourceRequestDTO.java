package com.smart_campus_operations_hub.hello_hub.dto;

import com.smart_campus_operations_hub.hello_hub.model.ResourceStatus;
import com.smart_campus_operations_hub.hello_hub.model.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceRequestDTO {

    @NotBlank
    private String name;

    @NotNull
    private ResourceType type;

    @NotNull
    @Min(1)
    private Integer capacity;

    @NotBlank
    private String location;

    @NotNull
    private LocalTime availabilityStartTime;

    @NotNull
    private LocalTime availabilityEndTime;

    @NotNull
    private ResourceStatus status;
}
