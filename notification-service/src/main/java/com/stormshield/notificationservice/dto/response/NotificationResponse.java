package com.stormshield.notificationservice.dto.response;

import com.stormshield.notificationservice.entity.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private Long userId;
    private String title;
    private String message;
    private NotificationType notificationType;
    private Long relatedEntityId;
    private Boolean isRead;
    private LocalDateTime sentAt;
}
