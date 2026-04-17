package com.stormshield.supportservice.dto;

import com.stormshield.supportservice.entity.RequestStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SupportRequestStatusUpdate {
    @NotNull(message = "Status cannot be null")
    private RequestStatus status;
}
