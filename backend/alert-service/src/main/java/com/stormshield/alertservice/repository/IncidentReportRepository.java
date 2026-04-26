package com.stormshield.alertservice.repository;

import com.stormshield.alertservice.entity.IncidentReport;
import com.stormshield.alertservice.entity.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface IncidentReportRepository extends JpaRepository<IncidentReport, Long>, JpaSpecificationExecutor<IncidentReport> {
    List<IncidentReport> findByStatus(ReportStatus status);
    List<IncidentReport> findByUserId(Long userId);
}
