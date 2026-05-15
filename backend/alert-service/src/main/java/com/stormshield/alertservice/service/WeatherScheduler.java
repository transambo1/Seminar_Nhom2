package com.stormshield.alertservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class WeatherScheduler {

    private final WeatherMonitoringService monitoringService;

    @Value("${weather.monitoring.enabled:true}")
    private boolean enabled;

    @Scheduled(fixedRateString = "${weather.monitoring.scan-interval-ms:900000}")
    public void scheduleWeatherScan() {
        if (!enabled) {
            log.debug("Weather monitoring is disabled via configuration.");
            return;
        }

        try {
            monitoringService.runFullWeatherMonitoringCycle();
        } catch (Exception e) {
            log.error("Unexpected error in weather scheduler: {}", e.getMessage());
        }
    }
}
