package com.stormshield.alertservice.controller;

import com.stormshield.alertservice.dto.request.IncidentReportCreateRequest;
import com.stormshield.alertservice.dto.request.IncidentReportReviewRequest;
import com.stormshield.alertservice.dto.response.IncidentReportResponse;
import com.stormshield.alertservice.service.IncidentReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/incident-reports")
@RequiredArgsConstructor
@Tag(name = "Incident Reports", description = "Endpoints for managing user submitted incident reports")
public class IncidentReportController {

    private final IncidentReportService reportService;

    @PostMapping
    @Operation(summary = "Submit a new incident report")
    public ResponseEntity<IncidentReportResponse> createReport(@Valid @RequestBody IncidentReportCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reportService.createReport(request));
    }

    @GetMapping
    @Operation(summary = "Get all incident reports")
    public ResponseEntity<List<IncidentReportResponse>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @GetMapping("/pending")
    @Operation(summary = "Get pending incident reports")
    public ResponseEntity<List<IncidentReportResponse>> getPendingReports() {
        return ResponseEntity.ok(reportService.getPendingReports());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get report details by ID")
    public ResponseEntity<IncidentReportResponse> getReportById(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getReportById(id));
    }

    @PutMapping("/{id}/review")
    @Operation(summary = "Review and approve/reject an incident report")
    public ResponseEntity<IncidentReportResponse> reviewReport(
            @PathVariable Long id,
            @Valid @RequestBody IncidentReportReviewRequest request) {
        return ResponseEntity.ok(reportService.reviewReport(id, request));
    }
}
