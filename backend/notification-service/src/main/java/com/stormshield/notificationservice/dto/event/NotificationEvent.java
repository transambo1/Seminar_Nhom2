package com.stormshield.notificationservice.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent implements Serializable {
    private String eventId;
    private String eventType;
    private Long recipientUserId;
    private String title;
    private String message;
    private String sourceService;
    private String sourceId;
    private LocalDateTime createdAt;
}
