package com.stormshield.supportservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SupportRequestAssign {
    @NotNull(message = "Assigned team/rescuer ID is required")
    private Long assignedTeamId;
}
