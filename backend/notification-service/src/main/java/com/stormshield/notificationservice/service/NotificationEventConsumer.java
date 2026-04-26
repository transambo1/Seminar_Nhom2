package com.stormshield.notificationservice.service;

import com.stormshield.notificationservice.config.RabbitMQConfig;
import com.stormshield.notificationservice.dto.event.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationEventConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = RabbitMQConfig.QUEUE)
    public void consumeEvent(NotificationEvent event) {
        log.info("Consumed event from RabbitMQ: {} (EventID: {})", event.getEventType(), event.getEventId());
        try {
            notificationService.saveNotificationFromEvent(event);
        } catch (Exception e) {
            log.error("Error processing consumed event {}: {}", event.getEventId(), e.getMessage());
        }
    }
}
