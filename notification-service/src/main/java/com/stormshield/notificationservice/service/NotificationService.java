package com.stormshield.notificationservice.service;

import com.stormshield.notificationservice.dto.request.NotificationCreateRequest;
import com.stormshield.notificationservice.dto.response.NotificationResponse;
import com.stormshield.notificationservice.dto.response.UnreadCountResponse;
import com.stormshield.notificationservice.entity.Notification;
import com.stormshield.notificationservice.repository.NotificationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationResponse createNotification(NotificationCreateRequest request) {
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .title(request.getTitle())
                .message(request.getMessage())
                .notificationType(request.getNotificationType())
                .relatedEntityId(request.getRelatedEntityId())
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("Mocking Push Notification Dispatched -> Firebase/APNS for User {}", saved.getUserId());
        
        return mapToResponse(saved);
    }

    public List<NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderBySentAtDesc(userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public NotificationResponse markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        return mapToResponse(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    public UnreadCountResponse getUnreadCount(Long userId) {
        long count = notificationRepository.countByUserIdAndIsReadFalse(userId);
        return new UnreadCountResponse(userId, count);
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId()).userId(n.getUserId())
                .title(n.getTitle()).message(n.getMessage())
                .notificationType(n.getNotificationType())
                .relatedEntityId(n.getRelatedEntityId())
                .isRead(n.getIsRead()).sentAt(n.getSentAt())
                .build();
    }
}
