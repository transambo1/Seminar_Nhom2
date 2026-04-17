package com.stormshield.reportservice.dto;

import com.stormshield.reportservice.entity.DangerLevel;
import com.stormshield.reportservice.entity.ReportType;
import com.stormshield.reportservice.entity.VerificationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReportResponse {
    private Long id;
    private Long userId;
    private ReportType reportType;
    private String description;
    private String imageUrl;
    private Double latitude;
    private Double longitude;
    private DangerLevel dangerLevel;
    private VerificationStatus verificationStatus;
    private Long verifiedBy;
    private LocalDateTime verifiedAt;
    private LocalDateTime createdAt;
}
