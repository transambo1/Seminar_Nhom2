package com.stormshield.alertservice.dto.response;

import com.stormshield.alertservice.entity.AlertStatus;
import com.stormshield.alertservice.entity.AlertType;
import com.stormshield.alertservice.entity.SeverityLevel;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AlertResponse {
    private Long id;
    private String title;
    private String description;
    private AlertType alertType;
    private SeverityLevel severityLevel;
    private String affectedArea;
    private Double latitude;
    private Double longitude;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String issuedBy;
    private AlertStatus status;
    private LocalDateTime createdAt;
}
