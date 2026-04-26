package com.stormshield.alertservice.service;

import com.stormshield.alertservice.config.RabbitMQConfig;
import com.stormshield.alertservice.dto.event.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishEvent(String eventType, Long recipientUserId, String title, String message, String sourceId, String routingKey) {
        NotificationEvent event = NotificationEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType(eventType)
                .recipientUserId(recipientUserId)
                .title(title)
                .message(message)
                .sourceService("alert-service")
                .sourceId(sourceId)
                .createdAt(LocalDateTime.now())
                .build();

        log.info("Publishing event: {} to exchange: {} with routingKey: {}", eventType, RabbitMQConfig.EXCHANGE, routingKey);
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, routingKey, event);
    }
}
