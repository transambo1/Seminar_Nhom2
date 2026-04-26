package com.stormshield.notificationservice.repository;

import com.stormshield.notificationservice.entity.Notification;
import com.stormshield.notificationservice.entity.NotificationStatus;
import com.stormshield.notificationservice.entity.NotificationType;
import com.stormshield.notificationservice.entity.RelatedEntityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(Long recipientUserId);
    
    List<Notification> findByRecipientUserIdAndStatusOrderByCreatedAtDesc(Long recipientUserId, NotificationStatus status);
    
    Long countByRecipientUserIdAndStatus(Long recipientUserId, NotificationStatus status);
    
    boolean existsByRecipientUserIdAndTypeAndRelatedEntityTypeAndRelatedEntityIdAndStatus(
            Long recipientUserId, NotificationType type, RelatedEntityType relatedEntityType, Long relatedEntityId, NotificationStatus status);
            
    List<Notification> findByRecipientUserIdAndStatus(Long recipientUserId, NotificationStatus status);

    boolean existsByEventId(String eventId);
}
