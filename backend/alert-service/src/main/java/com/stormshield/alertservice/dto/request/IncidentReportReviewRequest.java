package com.stormshield.alertservice.dto.request;

import com.stormshield.alertservice.entity.ReportStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class IncidentReportReviewRequest {
    @NotNull
    private ReportStatus status;
    private String reviewerNotes;
    private Long reviewedBy;
}
