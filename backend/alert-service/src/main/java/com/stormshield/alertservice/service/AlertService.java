package com.stormshield.alertservice.service;

import com.stormshield.alertservice.dto.request.AlertCreateRequest;
import com.stormshield.alertservice.dto.request.AlertFilterRequest;
import com.stormshield.alertservice.dto.response.AlertResponse;
import com.stormshield.alertservice.dto.request.AlertStatusUpdateRequest;
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
    private final NotificationEventPublisher eventPublisher;

    public AlertResponse createAlert(AlertCreateRequest request) {
        if (!request.isValidTimeRange()) {
            throw new RuntimeException("End time must be after start time");
        }

        Alert alert = Alert.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .alertType(request.getAlertType())
                .severityLevel(request.getSeverityLevel())
                .affectedArea(request.getAffectedArea())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
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

    public AlertResponse updateAlertStatus(Long id, AlertStatusUpdateRequest request) {
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
        log.info("==> [NOTIFY] Dispatched New Alert Notification for: {}", alert.getTitle());
        
        String eventType = "ALERT_CREATED";
        String routingKey = "alert.created";
        String title = "Cảnh báo thiên tai mới: " + alert.getTitle();
        String message = String.format("Có cảnh báo %s (%s) tại %s. Hãy chú ý an toàn.", 
                alert.getAlertType(), alert.getSeverityLevel(), alert.getAffectedArea());
        
        // Broadcast alert, so recipientUserId = null
        eventPublisher.publishEvent(eventType, null, title, message, String.valueOf(alert.getId()), routingKey);
    }

    public com.stormshield.alertservice.dto.response.AlertStatisticsResponse getStatistics() {
        return com.stormshield.alertservice.dto.response.AlertStatisticsResponse.builder()
                .totalAlerts(alertRepository.count())
                .activeAlerts(alertRepository.countByStatus(AlertStatus.ACTIVE))
                .expiredAlerts(alertRepository.countByStatus(AlertStatus.EXPIRED))
                .cancelledAlerts(alertRepository.countByStatus(AlertStatus.CANCELLED))
                .criticalAlerts(alertRepository.countBySeverityLevel(SeverityLevel.CRITICAL))
                .highAlerts(alertRepository.countBySeverityLevel(SeverityLevel.HIGH))
                .mediumAlerts(alertRepository.countBySeverityLevel(SeverityLevel.MEDIUM))
                .lowAlerts(alertRepository.countBySeverityLevel(SeverityLevel.LOW))
                .build();
    }

    private AlertResponse mapToResponse(Alert alert) {
        return AlertResponse.builder()
                .id(alert.getId())
                .title(alert.getTitle())
                .description(alert.getDescription())
                .alertType(alert.getAlertType())
                .severityLevel(alert.getSeverityLevel())
                .affectedArea(alert.getAffectedArea())
                .latitude(alert.getLatitude())
                .longitude(alert.getLongitude())
                .startTime(alert.getStartTime())
                .endTime(alert.getEndTime())
                .issuedBy(alert.getIssuedBy())
                .status(alert.getStatus())
                .createdAt(alert.getCreatedAt())
                .build();
    }
    public List<AlertResponse> filterAlerts(AlertFilterRequest request) {
        Specification<Alert> spec = request.specification();
        List<Alert> list = alertRepository.findAll(spec);

        Double userLat = request.getUserLat();
        Double userLng = request.getUserLng();
        Double radius = request.getRadiusInMeters();

        if (radius != null && userLat != null && userLng != null) {
            list = list.stream().filter(a -> {
                if (a.getLatitude() == null || a.getLongitude() == null) return false;
                double dist = calculateDistance(userLat, userLng, a.getLatitude(), a.getLongitude());
                return dist <= radius;
            }).collect(Collectors.toList());
        }

        String normalizedSortBy = request.getSortBy() == null ? "CREATED_AT" : request.getSortBy().toUpperCase();
        String normalizedDirection = request.getDirection() == null ? "DESC" : request.getDirection().toUpperCase();
        boolean isAsc = "ASC".equals(normalizedDirection);

        if ("DISTANCE".equals(normalizedSortBy)) {
            if (userLat == null || userLng == null) {
                throw new IllegalArgumentException("userLat and userLng are required when sortBy=DISTANCE");
            }

            list.sort((a1, a2) -> {
                double d1 = calculateDistance(userLat, userLng, a1.getLatitude(), a1.getLongitude());
                double d2 = calculateDistance(userLat, userLng, a2.getLatitude(), a2.getLongitude());
                return isAsc ? Double.compare(d1, d2) : Double.compare(d2, d1);
            });
        } else if ("SEVERITY".equals(normalizedSortBy)) {
            list.sort((a1, a2) -> {
                int s1 = a1.getSeverityLevel() == null ? 0 : a1.getSeverityLevel().ordinal();
                int s2 = a2.getSeverityLevel() == null ? 0 : a2.getSeverityLevel().ordinal();
                return isAsc ? Integer.compare(s1, s2) : Integer.compare(s2, s1);
            });
        } else {
            list.sort((a1, a2) -> {
                java.time.LocalDateTime t1 = a1.getCreatedAt();
                java.time.LocalDateTime t2 = a2.getCreatedAt();
                if (t1 == null || t2 == null) return 0;
                return isAsc ? t1.compareTo(t2) : t2.compareTo(t1);
            });
        }

        return list.stream().map(a -> {
            AlertResponse res = mapToResponse(a);
            if (userLat != null && userLng != null && a.getLatitude() != null && a.getLongitude() != null) {
                res.setDistance(calculateDistance(userLat, userLng, a.getLatitude(), a.getLongitude()));
            }
            return res;
        }).collect(Collectors.toList());
    }

    public List<AlertResponse> getExternalAlerts() {
        return alertRepository.findBySource("NASA_EONET").stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Double.MAX_VALUE;
        final int R = 6371; // km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c * 1000;
    }
}
