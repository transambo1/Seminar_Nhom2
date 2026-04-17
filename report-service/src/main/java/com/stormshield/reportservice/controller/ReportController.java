package com.stormshield.reportservice.controller;

import com.stormshield.reportservice.dto.ReportRequest;
import com.stormshield.reportservice.dto.ReportResponse;
import com.stormshield.reportservice.dto.ReviewRequest;
import com.stormshield.reportservice.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Community Hazard Reports", description = "Endpoints for managing citizen reports")
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    @Operation(summary = "Citizen submits a new hazard report")
    public ResponseEntity<ReportResponse> submitReport(@Valid @RequestBody ReportRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reportService.submitReport(request));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current user's reports. Extracts X-User-Id from headers if available.")
    public ResponseEntity<List<ReportResponse>> getMyReports(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(reportService.getReportsByUserId(userId));
    }

    @GetMapping("/pending")
    @Operation(summary = "Admin gets reports waiting for review")
    public ResponseEntity<List<ReportResponse>> getPendingReports() {
        return ResponseEntity.ok(reportService.getPendingReports());
    }

    @PatchMapping("/{id}/approve")
    @Operation(summary = "Admin approves a report")
    public ResponseEntity<ReportResponse> approveReport(@PathVariable Long id, @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reportService.approveReport(id, request));
    }

    @PatchMapping("/{id}/reject")
    @Operation(summary = "Admin rejects a report")
    public ResponseEntity<ReportResponse> rejectReport(@PathVariable Long id, @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reportService.rejectReport(id, request));
    }

    @GetMapping("/approved")
    @Operation(summary = "Get all approved reports for public map layer")
    public ResponseEntity<List<ReportResponse>> getApprovedReports() {
        return ResponseEntity.ok(reportService.getApprovedReports());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get report details by ID")
    public ResponseEntity<ReportResponse> getReportById(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getReportById(id));
    }
}
