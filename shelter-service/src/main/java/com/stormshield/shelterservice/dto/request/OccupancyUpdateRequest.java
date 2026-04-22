package com.stormshield.shelterservice.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OccupancyUpdateRequest {
    @NotNull(message = "Occupancy value is required")
    @Min(0)
    private Integer currentOccupancy;
}
