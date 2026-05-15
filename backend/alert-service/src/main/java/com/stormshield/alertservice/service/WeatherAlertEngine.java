package com.stormshield.alertservice.service;

import com.stormshield.alertservice.entity.WeatherLocation;
import com.stormshield.alertservice.entity.Alert;
import com.stormshield.alertservice.entity.AlertStatus;
import com.stormshield.alertservice.entity.AlertType;
import com.stormshield.alertservice.entity.SeverityLevel;
import com.stormshield.alertservice.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherAlertEngine {

    private final AlertRepository alertRepository;
    private final NotificationEventPublisher eventPublisher;
    private final WeatherLocationService weatherLocationService;
    private final Random random = new Random();

    // Configuration thresholds
    private static final double HEAVY_RAIN_THRESHOLD_MM = 70.0;
    private static final double CRITICAL_RAIN_THRESHOLD_MM = 120.0;
    private static final double STRONG_WIND_THRESHOLD_KMH = 50.0;
    private static final double CRITICAL_WIND_THRESHOLD_KMH = 90.0;

    /**
     * Periodic scan of all Vietnam provinces.
     * Fixed rate of 15 minutes (900000 ms).
     */
    @Scheduled(fixedRateString = "${weather.scan.interval:900000}")
    public void runNationwideWeatherScan() {
        log.info("Starting Nationwide Weather Scan for 63 provinces...");
        
        List<WeatherLocation> provinces = weatherLocationService.getAllVietnamWeatherLocations();
        
        for (WeatherLocation province : provinces) {
            processProvinceWeather(province);
        }
        
        log.info("Nationwide Weather Scan completed.");
    }

    private void processProvinceWeather(WeatherLocation province) {
        // Mocking API response for each province
        // In production, this calls a WeatherClient with province.getLatitude() / longitude()
        double currentRain = simulateRainfall(province);
        double currentWind = simulateWindSpeed(province);

        // Rule 1: Rainfall Evaluation
        evaluateRainfall(province, currentRain);

        // Rule 2: Wind Speed Evaluation
        evaluateWindSpeed(province, currentWind);
    }

    private void evaluateRainfall(WeatherLocation province, double mm) {
        if (mm >= CRITICAL_RAIN_THRESHOLD_MM) {
            handleWeatherAlert(province, "Mưa cực lớn - Nguy cơ lũ lụt", 
                String.format("Lượng mưa đo được %.1fmm tại %s. Nguy cơ ngập lụt và sạt lở rất cao.", mm, province.getProvinceName()),
                AlertType.FLOOD, SeverityLevel.CRITICAL);
        } else if (mm >= HEAVY_RAIN_THRESHOLD_MM) {
            handleWeatherAlert(province, "Cảnh báo mưa lớn", 
                String.format("Lượng mưa %.1fmm tại %s. Đề phòng ngập úng đô thị.", mm, province.getProvinceName()),
                AlertType.STORM, SeverityLevel.HIGH);
        }
    }

    private void evaluateWindSpeed(WeatherLocation province, double kmh) {
        if (kmh >= CRITICAL_WIND_THRESHOLD_KMH) {
            handleWeatherAlert(province, "Bão mạnh cấp độ cực cao", 
                String.format("Gió giật %.1fkm/h tại %s. Cảnh báo nguy hiểm tính mạng, tuyệt đối không ra ngoài.", kmh, province.getProvinceName()),
                AlertType.STORM, SeverityLevel.CRITICAL);
        } else if (kmh >= STRONG_WIND_THRESHOLD_KMH) {
            handleWeatherAlert(province, "Cảnh báo gió giật mạnh", 
                String.format("Gió mạnh %.1fkm/h tại %s. Đề phòng cây xanh gãy đổ.", kmh, province.getProvinceName()),
                AlertType.STORM, SeverityLevel.MEDIUM);
        }
    }

    private void handleWeatherAlert(WeatherLocation province, String title, String desc, AlertType type, SeverityLevel severity) {
        // Deduplication Logic: Check if an active alert of same type already exists for this province
        Optional<Alert> existingAlert = findActiveWeatherAlert(province.getProvinceCode(), type);

        if (existingAlert.isPresent()) {
            refreshExistingAlert(existingAlert.get(), desc, severity);
        } else {
            createNewWeatherAlert(province, title, desc, type, severity);
        }
    }

    private Optional<Alert> findActiveWeatherAlert(String provinceCode, AlertType type) {
        return alertRepository.findFirstByProvinceCodeAndAlertTypeAndSourceAndStatus(
                provinceCode, type, "WEATHER", AlertStatus.ACTIVE);
    }

    private void createNewWeatherAlert(WeatherLocation p, String title, String desc, AlertType type, SeverityLevel severity) {
        log.info("CREATING NEW WEATHER ALERT: {} in {}", title, p.getProvinceName());
        
        Alert alert = Alert.builder()
                .title(title)
                .description(desc)
                .alertType(type)
                .severityLevel(severity)
                .affectedArea(p.getProvinceName())
                .latitude(p.getLatitude())
                .longitude(p.getLongitude())
                .provinceCode(p.getProvinceCode())
                .provinceName(p.getProvinceName())
                .startTime(LocalDateTime.now())
                .endTime(LocalDateTime.now().plusHours(12)) // Default duration for weather alerts
                .issuedBy("Hệ thống StormShield (Weather Engine)")
                .status(AlertStatus.ACTIVE)
                .source("WEATHER")
                .build();

        Alert saved = alertRepository.save(alert);
        publishNotification(saved, true);
    }

    private void refreshExistingAlert(Alert alert, String newDesc, SeverityLevel severity) {
        log.info("REFRESHING EXISTING WEATHER ALERT: {} in {}", alert.getTitle(), alert.getProvinceName());
        
        alert.setDescription(newDesc);
        alert.setSeverityLevel(severity);
        alert.setEndTime(LocalDateTime.now().plusHours(12)); // Extend expiration
        
        alertRepository.save(alert);
        // Only publish if severity increased or significant update (omitted for brevity)
    }

    private void publishNotification(Alert alert, boolean isNew) {
        String eventType = isNew ? "ALERT_CREATED" : "ALERT_UPDATED";
        String title = "[HỆ THỐNG] " + alert.getTitle();
        eventPublisher.publishEvent(eventType, null, title, alert.getDescription(), String.valueOf(alert.getId()), "alert.created");
    }

    // Mock Simulation Logic
    private double simulateRainfall(WeatherLocation p) {
        // North gets more rain in this simulation today
        double base = "NORTH".equalsIgnoreCase(p.getRegion()) ? 50.0 : 10.0;
        return base + random.nextDouble() * 100;
    }

    private double simulateWindSpeed(WeatherLocation p) {
        // Central coast gets more wind in this simulation
        double base = "CENTRAL".equalsIgnoreCase(p.getRegion()) ? 40.0 : 10.0;
        return base + random.nextDouble() * 80;
    }
}
