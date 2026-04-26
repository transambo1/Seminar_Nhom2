package com.stormshield.alertservice.dto.response;

import com.stormshield.alertservice.entity.AlertType;
import com.stormshield.alertservice.entity.ReportStatus;
import com.stormshield.alertservice.entity.SeverityLevel;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class IncidentReportResponse {
    private Long id;
    private Long userId;
    private String title;
    private String description;
    private AlertType incidentType;
    private SeverityLevel severityLevel;
    private String affectedArea;
    private Double latitude;
    private Double longitude;
    private String imageUrl;
    private ReportStatus status;
    private Long reviewedBy;
    private LocalDateTime reviewedAt;
    private Long createdAlertId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
