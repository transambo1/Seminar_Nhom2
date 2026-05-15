package com.stormshield.supportservice.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class RescueTeamCreateRequest {
    @NotBlank(message = "Team name is required")
    private String name;

    @NotBlank(message = "Area is required")
    private String area;

    @NotBlank(message = "Phone is required")
    private String phone;

    private Double latitude;
    private Double longitude;

    @NotNull(message = "Leader ID is required")
    private Long leaderId;

    private Integer capacity;
}
