package com.stormshield.alertservice.dto.request;

import com.stormshield.alertservice.entity.AlertType;
import com.stormshield.alertservice.entity.SeverityLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class IncidentReportCreateRequest {
    @NotNull
    private Long userId;

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotNull
    private AlertType incidentType;

    @NotNull
    private SeverityLevel severityLevel;

    @NotBlank
    private String affectedArea;

    private Double latitude;
    private Double longitude;
    private String imageUrl;
}
