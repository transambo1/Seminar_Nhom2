package com.stormshield.supportservice.repository;

import com.stormshield.supportservice.entity.RescueTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RescueTeamRepository extends JpaRepository<RescueTeam, Long> {
}
