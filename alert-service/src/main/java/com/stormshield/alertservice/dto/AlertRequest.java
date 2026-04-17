package com.stormshield.alertservice.dto;

import com.stormshield.alertservice.entity.AlertType;
import com.stormshield.alertservice.entity.SeverityLevel;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AlertRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Alert type is required")
    private AlertType alertType;

    @NotNull(message = "Severity level is required")
    private SeverityLevel severityLevel;

    @NotBlank(message = "Affected area is required")
    private String affectedArea;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    @Future(message = "End time must be in the future")
    private LocalDateTime endTime;

    @NotBlank(message = "Issued by is required")
    private String issuedBy;

    public boolean isValidTimeRange() {
        if (startTime != null && endTime != null) {
            return endTime.isAfter(startTime);
        }
        return true;
    }
}
