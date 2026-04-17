package com.stormshield.alertservice.dto;

import com.stormshield.alertservice.entity.AlertStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AlertStatusRequest {
    @NotNull(message = "Status is required")
    private AlertStatus status;
}
