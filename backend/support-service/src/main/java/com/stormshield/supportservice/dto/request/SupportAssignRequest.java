package com.stormshield.supportservice.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SupportAssignRequest {
    @NotNull(message = "Assigned team ID is required")
    private Long assignedTeamId;

    private Long assignedRescueUserId;
}
