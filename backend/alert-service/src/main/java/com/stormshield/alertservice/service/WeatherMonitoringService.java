package com.stormshield.alertservice.service;

import com.stormshield.alertservice.dto.weather.WeatherRiskResult;
import com.stormshield.alertservice.dto.weather.WeatherSnapshotDto;
import com.stormshield.alertservice.entity.WeatherLocation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherMonitoringService {

    private final WeatherLocationService locationService;
    private final WeatherClient weatherClient;
    private final WeatherRuleEngine ruleEngine;
    private final WeatherAlertService alertService;
    private final DemoWeatherProvider demoWeatherProvider;

    @Value("${weather.monitoring.max-provinces-per-scan:63}")
    private int maxProvinces;

    @Value("${weather.demo-mode:false}")
    private boolean demoMode;

    @Value("${weather.demo-scenario:CENTRAL_STORM}")
    private String demoScenario;

    public void runFullWeatherMonitoringCycle() {
        if (demoMode) {
            log.info("RUNNING IN DEMO MODE - Scenario: {}", demoScenario);
        }
        log.info("Starting weather monitoring cycle...");
        
        List<WeatherLocation> locations = locationService.getAllVietnamWeatherLocations();
        
        // Apply limit if needed (for debugging/controlled rollout)
        List<WeatherLocation> targetLocations = locations.stream()
                .limit(maxProvinces)
                .collect(Collectors.toList());

        log.info("Total locations to scan: {}", targetLocations.size());

        int successCount = 0;
        int failureCount = 0;

        for (WeatherLocation location : targetLocations) {
            try {
                processSingleLocation(location);
                successCount++;
            } catch (Exception e) {
                log.error("Failed to monitor weather for {}: {}", location.getProvinceName(), e.getMessage());
                failureCount++;
            }
        }

        log.info("Weather monitoring cycle completed. Success: {}, Failures: {}", successCount, failureCount);
    }

    private void processSingleLocation(WeatherLocation location) {
        log.debug("Monitoring weather for {}", location.getProvinceName());

        // 1. Fetch (Real or Demo)
        WeatherSnapshotDto snapshot;
        if (demoMode) {
            snapshot = demoWeatherProvider.getDemoWeather(location, demoScenario)
                    .orElseGet(() -> createFallbackSnapshot(location));
        } else {
            snapshot = weatherClient.fetchWeather(location.getLatitude(), location.getLongitude());
            snapshot.setProvinceCode(location.getProvinceCode());
            snapshot.setProvinceName(location.getProvinceName());
        }

        // 2. Evaluate (Always using the same rule engine)
        List<WeatherRiskResult> risks = ruleEngine.evaluateRisk(snapshot);

        // 3. Persist (Always using the same persistence flow)
        alertService.processWeatherRisks(location, risks);
    }

    private WeatherSnapshotDto createFallbackSnapshot(WeatherLocation location) {
        return WeatherSnapshotDto.builder()
                .provinceCode(location.getProvinceCode())
                .provinceName(location.getProvinceName())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .temperature(25.0)
                .humidity(50)
                .windSpeed(0.0)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
