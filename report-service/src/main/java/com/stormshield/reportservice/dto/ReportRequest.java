package com.stormshield.reportservice.dto;

import com.stormshield.reportservice.entity.DangerLevel;
import com.stormshield.reportservice.entity.ReportType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReportRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Report type is required")
    private ReportType reportType;

    @NotBlank(message = "Description is required")
    private String description;

    private String imageUrl;

    @NotNull(message = "Latitude is required")
    @Min(-90)
    @Max(90)
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @Min(-180)
    @Max(180)
    private Double longitude;

    @NotNull(message = "Danger level is required")
    private DangerLevel dangerLevel;
}
