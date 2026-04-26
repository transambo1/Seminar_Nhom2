package com.stormshield.alertservice.dto.request;

import com.stormshield.alertservice.entity.AlertStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AlertStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private AlertStatus status;
}
