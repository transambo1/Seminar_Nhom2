package com.stormshield.reportservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewRequest {
    @NotNull(message = "Admin User ID is required to verify this report")
    private Long adminId;
}
