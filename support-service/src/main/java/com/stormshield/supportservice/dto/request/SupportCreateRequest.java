package com.stormshield.supportservice.dto.request;

import com.stormshield.supportservice.entity.PriorityLevel;
import com.stormshield.supportservice.entity.RequestType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class SupportCreateRequest {
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Request type is required")
    private RequestType requestType;

    @NotBlank(message = "Description cannot be blank")
    private String description;

    @NotNull(message = "Number of people is required")
    @Min(value = 1, message = "Number of people must be at least 1")
    private Integer numberOfPeople;

    @NotNull(message = "Latitude is required")
    @Min(-90) @Max(90)
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @Min(-180) @Max(180)
    private Double longitude;

    @NotNull(message = "Priority level is required")
    private PriorityLevel priorityLevel;
}
