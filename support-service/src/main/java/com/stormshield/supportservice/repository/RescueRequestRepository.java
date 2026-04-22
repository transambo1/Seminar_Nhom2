package com.stormshield.supportservice.repository;

import com.stormshield.supportservice.entity.RescueRequest;
import com.stormshield.supportservice.entity.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RescueRequestRepository extends JpaRepository<RescueRequest, Long>, JpaSpecificationExecutor<RescueRequest> {
    List<RescueRequest> findByUserId(Long userId);
    List<RescueRequest> findByStatus(RequestStatus status);
    long countByStatus(RequestStatus status);
}
