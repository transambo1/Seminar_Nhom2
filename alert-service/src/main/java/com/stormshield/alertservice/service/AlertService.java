package com.stormshield.alertservice.service;

import com.stormshield.alertservice.dto.AlertRequest;
import com.stormshield.alertservice.dto.AlertResponse;
import com.stormshield.alertservice.dto.AlertStatusRequest;
import com.stormshield.alertservice.entity.Alert;
import com.stormshield.alertservice.entity.AlertStatus;
import com.stormshield.alertservice.entity.AlertType;
import com.stormshield.alertservice.entity.SeverityLevel;
import com.stormshield.alertservice.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class AlertService {

    private final AlertRepository alertRepository;

    public AlertResponse createAlert(AlertRequest request) {
        if (!request.isValidTimeRange()) {
            throw new RuntimeException("End time must be after start time");
        }

        Alert alert = Alert.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .alertType(request.getAlertType())
                .severityLevel(request.getSeverityLevel())
                .affectedArea(request.getAffectedArea())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .issuedBy(request.getIssuedBy())
                .status(AlertStatus.ACTIVE)
                .build();

        Alert savedAlert = alertRepository.save(alert);
        
        // Placeholder publisher/service method call to trigger notification-service later
        publishAlertNotification(savedAlert);

        return mapToResponse(savedAlert);
    }

    public List<AlertResponse> getAllAlerts(AlertStatus status, AlertType type, SeverityLevel severity) {
        Specification<Alert> spec = Specification.where(null);
        
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (type != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("alertType"), type));
        }
        if (severity != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("severityLevel"), severity));
        }

        return alertRepository.findAll(spec)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public AlertResponse getAlertById(Long id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        return mapToResponse(alert);
    }

    public AlertResponse updateAlertStatus(Long id, AlertStatusRequest request) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        alert.setStatus(request.getStatus());
        return mapToResponse(alertRepository.save(alert));
    }

    public List<AlertResponse> getCurrentlyActiveAlerts() {
        return alertRepository.findActiveAndValidAlerts(LocalDateTime.now())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private void publishAlertNotification(Alert alert) {
        // NOTE: In Phase 5, replace this with RabbitMQ/Kafka publisher
        // e.g., rabbitTemplate.convertAndSend("alert.exchange", "alert.new", dto);
        log.info("==> [MOCK NOTIFICATION PUBLISHER] Dispatched New Alert Notification for: {}", alert.getTitle());
    }

    private AlertResponse mapToResponse(Alert alert) {
        return AlertResponse.builder()
                .id(alert.getId())
                .title(alert.getTitle())
                .description(alert.getDescription())
                .alertType(alert.getAlertType())
                .severityLevel(alert.getSeverityLevel())
                .affectedArea(alert.getAffectedArea())
                .startTime(alert.getStartTime())
                .endTime(alert.getEndTime())
                .issuedBy(alert.getIssuedBy())
                .status(alert.getStatus())
                .createdAt(alert.getCreatedAt())
                .build();
    }
}
