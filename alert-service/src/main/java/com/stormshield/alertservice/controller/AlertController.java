package com.stormshield.alertservice.controller;

import com.stormshield.alertservice.dto.AlertRequest;
import com.stormshield.alertservice.dto.AlertResponse;
import com.stormshield.alertservice.dto.AlertStatusRequest;
import com.stormshield.alertservice.entity.AlertStatus;
import com.stormshield.alertservice.entity.AlertType;
import com.stormshield.alertservice.entity.SeverityLevel;
import com.stormshield.alertservice.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
@Tag(name = "Emergency Alerts", description = "Endpoints for managing emergency alerts")
public class AlertController {

    private final AlertService alertService;

    @PostMapping
    @Operation(summary = "Create a new alert")
    public ResponseEntity<AlertResponse> createAlert(@Valid @RequestBody AlertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(alertService.createAlert(request));
    }

    @GetMapping
    @Operation(summary = "Get all alerts with optional filtering")
    public ResponseEntity<List<AlertResponse>> getAllAlerts(
            @RequestParam(required = false) AlertStatus status,
            @RequestParam(required = false) AlertType type,
            @RequestParam(required = false) SeverityLevel severity) {
        return ResponseEntity.ok(alertService.getAllAlerts(status, type, severity));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get alert details by ID")
    public ResponseEntity<AlertResponse> getAlertById(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.getAlertById(id));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update alert status")
    public ResponseEntity<AlertResponse> updateAlertStatus(@PathVariable Long id, @Valid @RequestBody AlertStatusRequest request) {
        return ResponseEntity.ok(alertService.updateAlertStatus(id, request));
    }

    @GetMapping("/active")
    @Operation(summary = "Get currently active and valid alerts")
    public ResponseEntity<List<AlertResponse>> getActiveAlerts() {
        return ResponseEntity.ok(alertService.getCurrentlyActiveAlerts());
    }
}
