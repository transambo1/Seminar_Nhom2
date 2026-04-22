package com.stormshield.shelterservice.dto.request;

import com.stormshield.shelterservice.entity.ShelterStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ShelterCreateRequest {
    @NotBlank(message = "Shelter name is required")
    private String name;

    private String address;

    @NotNull(message = "Latitude is required")
    @Min(-90)
    @Max(90)
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @Min(-180)
    @Max(180)
    private Double longitude;

    @NotNull(message = "Capacity is required")
    @Min(0)
    private Integer capacity;

    private String contactPhone;
    private String managedBy;
    private ShelterStatus status;
}
