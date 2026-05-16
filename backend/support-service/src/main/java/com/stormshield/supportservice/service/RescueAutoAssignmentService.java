package com.stormshield.supportservice.service;

import com.stormshield.supportservice.entity.*;
import com.stormshield.supportservice.repository.RescueTeamMemberRepository;
import com.stormshield.supportservice.repository.RescueTeamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RescueAutoAssignmentService {

    private final RescueTeamRepository teamRepository;
    private final RescueTeamMemberRepository memberRepository;

    @Transactional
    public void autoAssign(RescueRequest request) {
        log.info("==> Starting auto assignment for Request ID: {}", request.getId());

        List<RescueTeam> activeTeams = teamRepository.findByStatus(RescueTeamStatus.ACTIVE);
        if (activeTeams.isEmpty()) {
            setNoAvailableTeam(request, "Không có đội cứu hộ nào đang hoạt động");
            return;
        }

        double urgencyScore = calculateUrgencyScore(request.getPriorityLevel());

        Optional<RescueTeam> bestTeamOpt = activeTeams.stream()
                .filter(team -> team.getLatitude() != null && team.getLongitude() != null)
                .filter(team -> {
                    int capacity = team.getCapacity() != null ? team.getCapacity() : Integer.MAX_VALUE;
                    int load = team.getCurrentLoad() != null ? team.getCurrentLoad() : 0;
                    return load < capacity;
                })
                .map(team -> {
                    double distance = calculateDistance(request.getLatitude(), request.getLongitude(), 
                                                       team.getLatitude(), team.getLongitude());
                    double load = team.getCurrentLoad() != null ? team.getCurrentLoad() : 0;
                    double score = urgencyScore - (distance / 1000.0) * 2 - load * 5;
                    
                    log.debug("Team {}: distance={}m, load={}, score={}", team.getName(), distance, load, score);
                    return new TeamScore(team, score, distance);
                })
                .max(Comparator.comparingDouble(TeamScore::getScore))
                .map(TeamScore::getTeam);

        if (bestTeamOpt.isEmpty()) {
            // Fallback: pick team with lowest load if distance cannot be calculated or no team within range
            bestTeamOpt = activeTeams.stream()
                    .min(Comparator.comparingInt(t -> t.getCurrentLoad() != null ? t.getCurrentLoad() : 0));
        }

        if (bestTeamOpt.isPresent()) {
            RescueTeam team = bestTeamOpt.get();
            request.setAssignedTeamId(team.getId());
            
            if (request.getLatitude() != null && request.getLongitude() != null && 
                team.getLatitude() != null && team.getLongitude() != null) {
                request.setDistanceKm(calculateDistance(request.getLatitude(), request.getLongitude(), 
                                                       team.getLatitude(), team.getLongitude()) / 1000.0);
            }

            // Select member
            List<RescueTeamMember> members = memberRepository.findByTeamId(team.getId());
            Optional<RescueTeamMember> bestMemberOpt = members.stream()
                    .filter(m -> m.getUserId() != null)
                    .filter(m -> m.getStatus() == RescueMemberStatus.AVAILABLE)
                    .min(Comparator.comparingInt(m -> m.getCurrentLoad() != null ? m.getCurrentLoad() : 0));

            if (bestMemberOpt.isPresent()) {
                RescueTeamMember member = bestMemberOpt.get();
                request.setAssignedRescueUserId(member.getUserId());
                request.setAssignmentStatus(AssignmentStatus.AUTO_ASSIGNED);
                request.setAssignmentReason("Tự động phân công đội gần nhất và thành viên khả dụng");
                request.setStatus(RequestStatus.ASSIGNED);

                // Update load
                team.setCurrentLoad((team.getCurrentLoad() != null ? team.getCurrentLoad() : 0) + 1);
                member.setCurrentLoad((member.getCurrentLoad() != null ? member.getCurrentLoad() : 0) + 1);
                
                teamRepository.save(team);
                memberRepository.save(member);
                log.info("==> Assigned Team: {}, Member UserID: {}", team.getName(), member.getUserId());
            } else {
                request.setAssignedRescueUserId(null);
                request.setAssignmentStatus(AssignmentStatus.TEAM_ASSIGNED_NO_MEMBER);
                request.setAssignmentReason("Đã tìm thấy đội phù hợp nhưng chưa có thành viên khả dụng");
                request.setStatus(RequestStatus.ASSIGNED);
                
                team.setCurrentLoad((team.getCurrentLoad() != null ? team.getCurrentLoad() : 0) + 1);
                teamRepository.save(team);
                log.info("==> Assigned Team: {}, but NO available members", team.getName());
            }
        } else {
            setNoAvailableTeam(request, "Không tìm thấy đội cứu hộ khả dụng phù hợp");
        }
    }

    private void setNoAvailableTeam(RescueRequest request, String reason) {
        request.setAssignedTeamId(null);
        request.setAssignedRescueUserId(null);
        request.setAssignmentStatus(AssignmentStatus.NO_AVAILABLE_TEAM);
        request.setAssignmentReason(reason);
        request.setDistanceKm(null);
        request.setStatus(RequestStatus.PENDING);
        log.warn("==> Auto assignment failed: {}", reason);
    }

    private double calculateUrgencyScore(PriorityLevel priority) {
        if (priority == null) return 30.0;
        return switch (priority) {
            case CRITICAL -> 100.0;
            case HIGH -> 75.0;
            case MEDIUM -> 50.0;
            case LOW -> 25.0;
            default -> 30.0;
        };
    }

    private double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0.0;
        final int R = 6371; // km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c * 1000; // meters
    }

    @lombok.Value
    private static class TeamScore {
        RescueTeam team;
        double score;
        double distance;
    }
}
