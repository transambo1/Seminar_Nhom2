package com.stormshield.shelterservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OccupancyRequest {
    @NotNull(message = "Occupancy value is required")
    @Min(0)
    private Integer currentOccupancy;
}
