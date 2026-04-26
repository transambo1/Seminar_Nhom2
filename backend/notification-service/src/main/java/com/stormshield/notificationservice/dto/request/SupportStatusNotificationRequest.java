package com.stormshield.notificationservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportStatusNotificationRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Support Request ID is required")
    private Long supportRequestId;

    @NotBlank(message = "Status is required")
    private String status;

    @NotBlank(message = "Message is required")
    private String message;
}
