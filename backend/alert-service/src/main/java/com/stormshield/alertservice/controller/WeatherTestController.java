package com.stormshield.alertservice.controller;

import com.stormshield.alertservice.dto.weather.WeatherSnapshotDto;
import com.stormshield.alertservice.dto.weather.WeatherTestResponse;
import com.stormshield.alertservice.dto.weather.WeatherRiskResult;
import com.stormshield.alertservice.entity.WeatherLocation;
import com.stormshield.alertservice.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/weather/test")
@RequiredArgsConstructor
@Tag(name = "Weather Testing", description = "Endpoints to verify weather API integration")
public class WeatherTestController {

    private final WeatherClient weatherClient;
    private final WeatherLocationService locationService;
    private final WeatherRuleEngine ruleEngine;
    private final WeatherAlertService weatherAlertService;
    private final WeatherMonitoringService monitoringService;

    @PostMapping("/scan/full")
    @Operation(summary = "Manually trigger a full nationwide weather scan cycle")
    public ResponseEntity<String> runFullScan() {
        monitoringService.runFullWeatherMonitoringCycle();
        return ResponseEntity.ok("Weather monitoring cycle completed. Use 'fetchData' to see generated alerts.");
    }

    @GetMapping
    @Operation(summary = "Test weather fetch and risk evaluation by coordinates")
    public ResponseEntity<WeatherTestResponse> testByCoords(
            @RequestParam double lat, 
            @RequestParam double lng) {
        WeatherSnapshotDto snapshot = weatherClient.fetchWeather(lat, lng);
        List<WeatherRiskResult> risks = ruleEngine.evaluateRisk(snapshot);
        
        return ResponseEntity.ok(WeatherTestResponse.builder()
                .snapshot(snapshot)
                .risks(risks)
                .build());
    }

    @GetMapping("/province/{code}")
    @Operation(summary = "Test weather fetch and risk evaluation by province code")
    public ResponseEntity<WeatherTestResponse> testByProvince(@PathVariable String code) {
        WeatherLocation location = findLocationOrThrow(code);

        WeatherSnapshotDto snapshot = weatherClient.fetchWeather(location.getLatitude(), location.getLongitude());
        snapshot.setProvinceCode(location.getProvinceCode());
        snapshot.setProvinceName(location.getProvinceName());
        
        List<WeatherRiskResult> risks = ruleEngine.evaluateRisk(snapshot);
        
        return ResponseEntity.ok(WeatherTestResponse.builder()
                .snapshot(snapshot)
                .risks(risks)
                .build());
    }

    @PostMapping("/persist/province/{code}")
    @Operation(summary = "Full flow test: Fetch -> Evaluate -> Persist Alert")
    public ResponseEntity<String> persistByProvince(@PathVariable String code) {
        WeatherLocation location = findLocationOrThrow(code);

        WeatherSnapshotDto snapshot = weatherClient.fetchWeather(location.getLatitude(), location.getLongitude());
        snapshot.setProvinceCode(location.getProvinceCode());
        snapshot.setProvinceName(location.getProvinceName());
        
        List<WeatherRiskResult> risks = ruleEngine.evaluateRisk(snapshot);
        
        weatherAlertService.processWeatherRisks(location, risks);
        
        return ResponseEntity.ok("Weather risks processed for " + location.getProvinceName() + ". Check alerts table.");
    }

    private WeatherLocation findLocationOrThrow(String code) {
        return locationService.getAllVietnamWeatherLocations().stream()
                .filter(l -> l.getProvinceCode().equalsIgnoreCase(code))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Province not found: " + code));
    }
}
