package com.stormshield.supportservice.dto.request;

import com.stormshield.supportservice.entity.RequestStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SupportStatusUpdateRequest {
    @NotNull(message = "Status cannot be null")
    private RequestStatus status;
}
