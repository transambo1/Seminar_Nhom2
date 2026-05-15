package com.stormshield.alertservice.service;

import com.stormshield.alertservice.dto.weather.WeatherRiskResult;
import com.stormshield.alertservice.entity.Alert;
import com.stormshield.alertservice.entity.AlertStatus;
import com.stormshield.alertservice.entity.WeatherLocation;
import com.stormshield.alertservice.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherAlertService {

    private final AlertRepository alertRepository;
    private final NotificationEventPublisher eventPublisher;

    @Transactional
    public void processWeatherRisks(WeatherLocation location, List<WeatherRiskResult> risks) {
        if (risks == null || risks.isEmpty()) {
            log.info("No weather risks detected for location: {}", location.getProvinceName());
            return;
        }

        for (WeatherRiskResult risk : risks) {
            if (!risk.isTriggered()) continue;

            handleSingleRisk(location, risk);
        }
    }

    private void handleSingleRisk(WeatherLocation location, WeatherRiskResult risk) {
        // Uniqueness logic: province + alertType + WEATHER + ACTIVE
        Optional<Alert> existingAlert = alertRepository.findFirstByProvinceCodeAndAlertTypeAndSourceAndStatus(
                location.getProvinceCode(),
                risk.getAlertType(),
                "WEATHER",
                AlertStatus.ACTIVE
        );

        if (existingAlert.isPresent()) {
            updateAlert(existingAlert.get(), risk);
        } else {
            createNewAlert(location, risk);
        }
    }

    private void createNewAlert(WeatherLocation location, WeatherRiskResult risk) {
        log.info("Creating new weather alert: {} for {}", risk.getTitle(), location.getProvinceName());

        Alert alert = Alert.builder()
                .title(risk.getTitle())
                .description(risk.getDescription())
                .alertType(risk.getAlertType())
                .severityLevel(risk.getSeverity())
                .affectedArea(location.getProvinceName())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .provinceCode(location.getProvinceCode())
                .provinceName(location.getProvinceName())
                .startTime(LocalDateTime.now())
                .endTime(LocalDateTime.now().plusHours(6)) // Default 6 hour window
                .issuedBy("Hệ thống StormShield (Weather Engine)")
                .status(AlertStatus.ACTIVE)
                .source("WEATHER")
                .updatedAt(LocalDateTime.now())
                .build();

        Alert saved = alertRepository.save(alert);
        
        // Broadcast notification
        publishAlertNotification(saved, true);
    }

    private void updateAlert(Alert alert, WeatherRiskResult risk) {
        log.info("Refreshing existing weather alert: ID={} for {}", alert.getId(), alert.getProvinceName());

        alert.setTitle(risk.getTitle());
        alert.setDescription(risk.getDescription());
        alert.setSeverityLevel(risk.getSeverity());
        alert.setUpdatedAt(LocalDateTime.now());
        alert.setEndTime(LocalDateTime.now().plusHours(6)); // Extend expiration

        alertRepository.save(alert);
        
        // Broadcast notification (optional for updates, but good for seminar demo)
        publishAlertNotification(alert, false);
    }

    private void publishAlertNotification(Alert alert, boolean isNew) {
        String eventType = isNew ? "ALERT_CREATED" : "ALERT_UPDATED";
        String title = "[HỆ THỐNG] " + alert.getTitle();
        String message = alert.getDescription();
        
        eventPublisher.publishEvent(eventType, null, title, message, String.valueOf(alert.getId()), "alert.created");
    }
}
