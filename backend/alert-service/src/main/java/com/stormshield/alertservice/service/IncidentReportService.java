package com.stormshield.alertservice.service;

import com.stormshield.alertservice.dto.request.IncidentReportCreateRequest;
import com.stormshield.alertservice.dto.request.IncidentReportReviewRequest;
import com.stormshield.alertservice.dto.response.IncidentReportResponse;
import com.stormshield.alertservice.entity.Alert;
import com.stormshield.alertservice.entity.AlertStatus;
import com.stormshield.alertservice.entity.IncidentReport;
import com.stormshield.alertservice.entity.ReportStatus;
import com.stormshield.alertservice.repository.AlertRepository;
import com.stormshield.alertservice.repository.IncidentReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class IncidentReportService {

    private final IncidentReportRepository reportRepository;
    private final AlertRepository alertRepository;
    private final NotificationEventPublisher eventPublisher;

    @Transactional
    public IncidentReportResponse createReport(IncidentReportCreateRequest request) {
        IncidentReport report = IncidentReport.builder()
                .userId(request.getUserId())
                .title(request.getTitle())
                .description(request.getDescription())
                .incidentType(request.getIncidentType())
                .severityLevel(request.getSeverityLevel())
                .affectedArea(request.getAffectedArea())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .imageUrl(request.getImageUrl())
                .status(ReportStatus.PENDING)
                .build();

        IncidentReport saved = reportRepository.save(report);
        return mapToResponse(saved);
    }

    public List<IncidentReportResponse> getAllReports() {
        return reportRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<IncidentReportResponse> getPendingReports() {
        return reportRepository.findByStatus(ReportStatus.PENDING).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public IncidentReportResponse getReportById(Long id) {
        IncidentReport report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident Report not found"));
        return mapToResponse(report);
    }

    @Transactional
    public IncidentReportResponse reviewReport(Long id, IncidentReportReviewRequest request) {
        IncidentReport report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident Report not found"));

        if (report.getStatus() != ReportStatus.PENDING) {
            throw new IllegalStateException("Only PENDING reports can be reviewed");
        }

        report.setReviewedBy(request.getReviewedBy());
        report.setReviewedAt(LocalDateTime.now());

        if (request.getStatus() == ReportStatus.APPROVED) {
            report.setStatus(ReportStatus.APPROVED);

            Alert alert = Alert.builder()
                    .title(report.getTitle())
                    .description(report.getDescription())
                    .alertType(report.getIncidentType())
                    .severityLevel(report.getSeverityLevel())
                    .affectedArea(report.getAffectedArea())
                    .latitude(report.getLatitude())
                    .longitude(report.getLongitude())
                    .startTime(LocalDateTime.now())
                    // Assuming an alert lasts for 24 hours from creation by default if from user report
                    .endTime(LocalDateTime.now().plusDays(1)) 
                    .issuedBy(request.getReviewedBy() != null ? String.valueOf(request.getReviewedBy()) : "ADMIN")
                    .status(AlertStatus.ACTIVE)
                    .source("USER_REPORT")
                    .createdFromReportId(report.getId())
                    .build();

            Alert savedAlert = alertRepository.save(alert);
            report.setCreatedAlertId(savedAlert.getId());

        } else if (request.getStatus() == ReportStatus.REJECTED) {
            report.setStatus(ReportStatus.REJECTED);
        }

        IncidentReport updated = reportRepository.save(report);
        
        // Publish notification
        if (updated.getStatus() == ReportStatus.APPROVED || updated.getStatus() == ReportStatus.REJECTED) {
            String eventType = updated.getStatus() == ReportStatus.APPROVED ? "INCIDENT_REPORT_APPROVED" : "INCIDENT_REPORT_REJECTED";
            String title = updated.getStatus() == ReportStatus.APPROVED ? "Báo cáo sự cố đã được duyệt" : "Báo cáo sự cố đã bị từ chối";
            String message = updated.getStatus() == ReportStatus.APPROVED 
                ? String.format("Báo cáo về %s tại %s của bạn đã được duyệt và chuyển thành cảnh báo chính thức.", updated.getIncidentType(), updated.getAffectedArea())
                : String.format("Báo cáo về %s tại %s của bạn đã bị từ chối.", updated.getIncidentType(), updated.getAffectedArea());
            
            eventPublisher.publishEvent(eventType, updated.getUserId(), title, message, String.valueOf(updated.getId()), "alert.incident.review");
        }

        return mapToResponse(updated);
    }

    private IncidentReportResponse mapToResponse(IncidentReport r) {
        return IncidentReportResponse.builder()
                .id(r.getId())
                .userId(r.getUserId())
                .title(r.getTitle())
                .description(r.getDescription())
                .incidentType(r.getIncidentType())
                .severityLevel(r.getSeverityLevel())
                .affectedArea(r.getAffectedArea())
                .latitude(r.getLatitude())
                .longitude(r.getLongitude())
                .imageUrl(r.getImageUrl())
                .status(r.getStatus())
                .reviewedBy(r.getReviewedBy())
                .reviewedAt(r.getReviewedAt())
                .createdAlertId(r.getCreatedAlertId())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
