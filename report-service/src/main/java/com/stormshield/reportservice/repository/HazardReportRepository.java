package com.stormshield.reportservice.repository;

import com.stormshield.reportservice.entity.HazardReport;
import com.stormshield.reportservice.entity.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HazardReportRepository extends JpaRepository<HazardReport, Long> {

    List<HazardReport> findByUserId(Long userId);
    
    List<HazardReport> findByVerificationStatus(VerificationStatus status);
}
