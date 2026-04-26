package com.stormshield.notificationservice.dto.response;

import com.stormshield.notificationservice.entity.NotificationStatus;
import com.stormshield.notificationservice.entity.NotificationType;
import com.stormshield.notificationservice.entity.RelatedEntityType;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private Long userId;
    private String title;
    private String message;
    private NotificationType type;
    private NotificationStatus status;
    private RelatedEntityType relatedEntityType;
    private Long relatedEntityId;
    private Double latitude;
    private Double longitude;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime readAt;
}
