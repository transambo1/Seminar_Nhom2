package com.stormshield.supportservice.repository;

import com.stormshield.supportservice.entity.RescueTeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RescueTeamMemberRepository extends JpaRepository<RescueTeamMember, Long> {
    List<RescueTeamMember> findByTeamId(Long teamId);
    void deleteByTeamIdAndUserId(Long teamId, Long userId);
    boolean existsByTeamIdAndUserId(Long teamId, Long userId);
}
