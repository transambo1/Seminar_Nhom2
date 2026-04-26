package com.stormshield.notificationservice.service;

import com.stormshield.notificationservice.dto.request.*;
import com.stormshield.notificationservice.dto.response.*;
import com.stormshield.notificationservice.entity.*;
import com.stormshield.notificationservice.repository.NotificationRepository;
import com.stormshield.notificationservice.util.DistanceUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final RestTemplate restTemplate;
    
    // SSE emitters storage: userId -> SseEmitter
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    @Value("${services.alert-service.active-alerts-url}")
    private String activeAlertsUrl;

    public SseEmitter createEmitter(Long userId) {
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L); // 30 mins
        this.emitters.put(userId, emitter);

        emitter.onCompletion(() -> this.emitters.remove(userId));
        emitter.onTimeout(() -> this.emitters.remove(userId));
        emitter.onError((e) -> this.emitters.remove(userId));

        // Send a connected event
        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data("Connected to StormShield Notification Stream"));
        } catch (IOException e) {
            log.error("Failed to send connected event to user {}", userId);
        }

        return emitter;
    }

    public void pushNotification(Notification notification) {
        NotificationResponse response = mapToResponse(notification);
        
        if (notification.getRecipientUserId() != null) {
            // Unicast
            sendToUser(notification.getRecipientUserId(), response);
        } else {
            // Broadcast
            emitters.forEach((userId, emitter) -> sendToUser(userId, response));
        }
    }

    private void sendToUser(Long userId, NotificationResponse response) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(response));
                log.info("SSE: Pushed notification to user {}", userId);
            } catch (IOException e) {
                emitters.remove(userId);
                log.error("SSE: Error pushing notification to user {}, removed emitter", userId);
            }
        }
    }

    @Transactional
    public NotificationResponse createNotification(NotificationCreateRequest request) {
        Notification notification = Notification.builder()
                .recipientUserId(request.getUserId())
                .title(request.getTitle())
                .message(request.getMessage())
                .type(request.getType())
                .status(NotificationStatus.UNREAD)
                .relatedEntityType(request.getRelatedEntityType())
                .relatedEntityId(request.getRelatedEntityId())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();

        Notification saved = notificationRepository.save(notification);
        pushNotification(saved);
        return mapToResponse(saved);
    }

    @Transactional
    public void saveNotificationFromEvent(com.stormshield.notificationservice.dto.event.NotificationEvent event) {
        if (event.getEventId() != null && notificationRepository.existsByEventId(event.getEventId())) {
            log.warn("Duplicate event detected: {}. Skipping.", event.getEventId());
            return;
        }

        Notification notification = Notification.builder()
                .eventId(event.getEventId())
                .recipientUserId(event.getRecipientUserId())
                .title(event.getTitle())
                .message(event.getMessage())
                .type(NotificationType.valueOf(event.getEventType()))
                .status(NotificationStatus.UNREAD)
                .sourceService(event.getSourceService())
                .sourceId(event.getSourceId())
                .build();

        // Try to infer relatedEntityType and ID from eventType
        if (event.getEventType().startsWith("SUPPORT_")) {
            notification.setRelatedEntityType(RelatedEntityType.SUPPORT_REQUEST);
        } else if (event.getEventType().startsWith("ALERT_")) {
            notification.setRelatedEntityType(RelatedEntityType.ALERT);
        } else if (event.getEventType().startsWith("INCIDENT_")) {
            notification.setRelatedEntityType(RelatedEntityType.INCIDENT_REPORT);
        }
        
        if (event.getSourceId() != null) {
            try {
                notification.setRelatedEntityId(Long.parseLong(event.getSourceId()));
            } catch (NumberFormatException ignored) {}
        }

        Notification saved = notificationRepository.save(notification);
        log.info("Saved notification from event: {}", event.getEventId());
        pushNotification(saved);
    }

    public List<NotificationResponse> getNotificationsByUser(Long userId) {
        return notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<NotificationResponse> getUnreadNotificationsByUser(Long userId) {
        return notificationRepository.findByRecipientUserIdAndStatusOrderByCreatedAtDesc(userId, NotificationStatus.UNREAD)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public UnreadCountResponse getUnreadCount(Long userId) {
        Long count = notificationRepository.countByRecipientUserIdAndStatus(userId, NotificationStatus.UNREAD);
        return UnreadCountResponse.builder()
                .userId(userId)
                .unreadCount(count)
                .build();
    }

    @Transactional
    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(notification -> {
            notification.setStatus(NotificationStatus.READ);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        });
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByRecipientUserIdAndStatus(userId, NotificationStatus.UNREAD);
        LocalDateTime now = LocalDateTime.now();
        unread.forEach(notification -> {
            notification.setStatus(NotificationStatus.READ);
            notification.setReadAt(now);
        });
        notificationRepository.saveAll(unread);
    }

    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    @Transactional
    public NearbyAlertCheckResponse checkNearbyAlerts(NearbyAlertCheckRequest request) {
        log.info("Checking nearby alerts for user {} at ({}, {})", request.getUserId(), request.getLatitude(), request.getLongitude());
        
        double radius = request.getRadiusKm() != null ? request.getRadiusKm() : 10.0;
        if (radius > 100) radius = 100;

        AlertResponse[] activeAlerts;
        try {
            activeAlerts = restTemplate.getForObject(activeAlertsUrl, AlertResponse[].class);
        } catch (Exception e) {
            log.error("Failed to fetch active alerts from {}: {}", activeAlertsUrl, e.getMessage());
            return NearbyAlertCheckResponse.builder()
                    .userId(request.getUserId())
                    .radiusKm(radius)
                    .nearbyAlerts(0)
                    .notificationsCreated(0)
                    .build();
        }

        if (activeAlerts == null || activeAlerts.length == 0) {
            return NearbyAlertCheckResponse.builder()
                    .userId(request.getUserId())
                    .radiusKm(radius)
                    .nearbyAlerts(0)
                    .notificationsCreated(0)
                    .build();
        }

        int nearbyCount = 0;
        int createdCount = 0;

        for (AlertResponse alert : activeAlerts) {
            if (alert.getLatitude() == null || alert.getLongitude() == null) continue;

            double distance = DistanceUtils.haversineKm(
                    request.getLatitude(), request.getLongitude(),
                    alert.getLatitude(), alert.getLongitude());

            if (distance <= radius) {
                nearbyCount++;
                
                // Avoid duplicates
                boolean exists = notificationRepository.existsByRecipientUserIdAndTypeAndRelatedEntityTypeAndRelatedEntityIdAndStatus(
                        request.getUserId(),
                        NotificationType.NEARBY_ALERT,
                        RelatedEntityType.ALERT,
                        alert.getId(),
                        NotificationStatus.UNREAD
                );

                if (!exists) {
                    Notification notification = Notification.builder()
                            .recipientUserId(request.getUserId())
                            .title("Cảnh báo nguy hiểm gần bạn")
                            .message(String.format("Có cảnh báo %s tại %s trong bán kính %.1fkm.", 
                                    alert.getType(), alert.getAffectedArea(), radius))
                            .type(NotificationType.NEARBY_ALERT)
                            .status(NotificationStatus.UNREAD)
                            .relatedEntityType(RelatedEntityType.ALERT)
                            .relatedEntityId(alert.getId())
                            .latitude(alert.getLatitude())
                            .longitude(alert.getLongitude())
                            .build();
                    notificationRepository.save(notification);
                    pushNotification(notification);
                    createdCount++;
                }
            }
        }

        return NearbyAlertCheckResponse.builder()
                .userId(request.getUserId())
                .radiusKm(radius)
                .nearbyAlerts(nearbyCount)
                .notificationsCreated(createdCount)
                .build();
    }

    public NotificationResponse createSupportStatusNotification(SupportStatusNotificationRequest request) {
        Notification notification = Notification.builder()
                .recipientUserId(request.getUserId())
                .title("Cập nhật trạng thái yêu cầu cứu trợ")
                .message(request.getMessage())
                .type(NotificationType.SUPPORT_STATUS_UPDATED)
                .status(NotificationStatus.UNREAD)
                .relatedEntityType(RelatedEntityType.SUPPORT_REQUEST)
                .relatedEntityId(request.getSupportRequestId())
                .build();

        Notification saved = notificationRepository.save(notification);
        pushNotification(saved);
        return mapToResponse(saved);
    }

    public NotificationResponse createIncidentReviewNotification(IncidentReviewNotificationRequest request) {
        NotificationType type = "APPROVED".equalsIgnoreCase(request.getReviewStatus()) 
                ? NotificationType.INCIDENT_REPORT_APPROVED 
                : NotificationType.INCIDENT_REPORT_REJECTED;
        
        Notification notification = Notification.builder()
                .recipientUserId(request.getUserId())
                .title("Kết quả duyệt báo cáo sự cố")
                .message(request.getMessage())
                .type(type)
                .status(NotificationStatus.UNREAD)
                .relatedEntityType(RelatedEntityType.INCIDENT_REPORT)
                .relatedEntityId(request.getIncidentReportId())
                .build();

        Notification saved = notificationRepository.save(notification);
        pushNotification(saved);
        return mapToResponse(saved);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getRecipientUserId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .status(notification.getStatus())
                .relatedEntityType(notification.getRelatedEntityType())
                .relatedEntityId(notification.getRelatedEntityId())
                .latitude(notification.getLatitude())
                .longitude(notification.getLongitude())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .build();
    }
}
