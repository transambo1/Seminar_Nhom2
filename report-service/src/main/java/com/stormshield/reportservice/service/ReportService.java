package com.stormshield.reportservice.service;

import com.stormshield.reportservice.dto.ReportRequest;
import com.stormshield.reportservice.dto.ReportResponse;
import com.stormshield.reportservice.dto.ReviewRequest;
import com.stormshield.reportservice.entity.HazardReport;
import com.stormshield.reportservice.entity.VerificationStatus;
import com.stormshield.reportservice.repository.HazardReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ReportService {

    private final HazardReportRepository reportRepository;

    public ReportResponse submitReport(ReportRequest request) {
        HazardReport report = HazardReport.builder()
                .userId(request.getUserId())
                .reportType(request.getReportType())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .dangerLevel(request.getDangerLevel())
                .verificationStatus(VerificationStatus.PENDING)
                .build();

        return mapToResponse(reportRepository.save(report));
    }

    public List<ReportResponse> getReportsByUserId(Long userId) {
        return reportRepository.findByUserId(userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ReportResponse> getPendingReports() {
        return reportRepository.findByVerificationStatus(VerificationStatus.PENDING)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ReportResponse> getApprovedReports() {
        return reportRepository.findByVerificationStatus(VerificationStatus.APPROVED)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public ReportResponse getReportById(Long id) {
        HazardReport report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        return mapToResponse(report);
    }

    public ReportResponse approveReport(Long id, ReviewRequest request) {
        HazardReport report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setVerificationStatus(VerificationStatus.APPROVED);
        report.setVerifiedBy(request.getAdminId());
        report.setVerifiedAt(LocalDateTime.now());

        return mapToResponse(reportRepository.save(report));
    }

    public ReportResponse rejectReport(Long id, ReviewRequest request) {
        HazardReport report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setVerificationStatus(VerificationStatus.REJECTED);
        report.setVerifiedBy(request.getAdminId());
        report.setVerifiedAt(LocalDateTime.now());

        return mapToResponse(reportRepository.save(report));
    }

    private ReportResponse mapToResponse(HazardReport report) {
        return ReportResponse.builder()
                .id(report.getId())
                .userId(report.getUserId())
                .reportType(report.getReportType())
                .description(report.getDescription())
                .imageUrl(report.getImageUrl())
                .latitude(report.getLatitude())
                .longitude(report.getLongitude())
                .dangerLevel(report.getDangerLevel())
                .verificationStatus(report.getVerificationStatus())
                .verifiedBy(report.getVerifiedBy())
                .verifiedAt(report.getVerifiedAt())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
