package com.stormshield.notificationservice.dto.request;

import com.stormshield.notificationservice.entity.NotificationType;
import com.stormshield.notificationservice.entity.RelatedEntityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationCreateRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    @NotNull(message = "Notification type is required")
    private NotificationType type;

    private RelatedEntityType relatedEntityType;

    private Long relatedEntityId;

    private Double latitude;

    private Double longitude;
}
