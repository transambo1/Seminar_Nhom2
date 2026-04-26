package com.stormshield.alertservice.repository;

import com.stormshield.alertservice.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long>, JpaSpecificationExecutor<Alert> {
    
    @Query("SELECT a FROM Alert a WHERE a.status = 'ACTIVE' AND (a.source = 'NASA_EONET' OR (a.startTime <= :now AND a.endTime >= :now))")
    List<Alert> findActiveAndValidAlerts(LocalDateTime now);

    long countByStatus(com.stormshield.alertservice.entity.AlertStatus status);
    long countBySeverityLevel(com.stormshield.alertservice.entity.SeverityLevel severityLevel);

    boolean existsBySourceAndExternalEventId(String source, String externalEventId);
    List<Alert> findBySource(String source);
}
