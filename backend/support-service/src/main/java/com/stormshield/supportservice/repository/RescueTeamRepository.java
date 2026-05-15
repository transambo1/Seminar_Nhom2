package com.stormshield.supportservice.repository;

import com.stormshield.supportservice.entity.RescueTeam;
import com.stormshield.supportservice.entity.RescueTeamStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RescueTeamRepository extends JpaRepository<RescueTeam, Long> {
    List<RescueTeam> findByStatus(RescueTeamStatus status);
}
