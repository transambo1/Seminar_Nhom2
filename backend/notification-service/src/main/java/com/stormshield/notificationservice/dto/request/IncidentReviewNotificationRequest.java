package com.stormshield.notificationservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentReviewNotificationRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Incident Report ID is required")
    private Long incidentReportId;

    @NotBlank(message = "Review status is required")
    private String reviewStatus;

    @NotBlank(message = "Message is required")
    private String message;
}
