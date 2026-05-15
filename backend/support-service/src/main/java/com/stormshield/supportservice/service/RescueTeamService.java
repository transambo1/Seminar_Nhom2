package com.stormshield.supportservice.service;

import com.stormshield.supportservice.dto.request.RescueTeamCreateRequest;
import com.stormshield.supportservice.dto.request.RescueTeamMemberCreateRequest;
import com.stormshield.supportservice.dto.response.RescueTeamMemberResponse;
import com.stormshield.supportservice.dto.response.RescueTeamResponse;
import com.stormshield.supportservice.entity.*;
import com.stormshield.supportservice.repository.RescueTeamMemberRepository;
import com.stormshield.supportservice.repository.RescueTeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RescueTeamService {

    private final RescueTeamRepository teamRepository;
    private final RescueTeamMemberRepository memberRepository;

    @Transactional
    public RescueTeamResponse createTeam(RescueTeamCreateRequest request) {
        RescueTeam team = RescueTeam.builder()
                .name(request.getName())
                .area(request.getArea())
                .phone(request.getPhone())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .leaderId(request.getLeaderId())
                .status(RescueTeamStatus.ACTIVE)
                .capacity(request.getCapacity() != null ? request.getCapacity() : 10)
                .currentLoad(0)
                .build();

        RescueTeam savedTeam = teamRepository.save(team);

        // Auto add leader as a member
        RescueTeamMember leader = RescueTeamMember.builder()
                .teamId(savedTeam.getId())
                .userId(request.getLeaderId())
                .memberRole(RescueMemberRole.LEADER)
                .status(RescueMemberStatus.AVAILABLE)
                .currentLoad(0)
                .build();
        memberRepository.save(leader);

        return mapToTeamResponse(savedTeam);
    }

    public List<RescueTeamResponse> getAllTeams() {
        return teamRepository.findAll().stream()
                .map(this::mapToTeamResponse)
                .collect(Collectors.toList());
    }

    public RescueTeamResponse getTeamById(Long id) {
        RescueTeam team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        return mapToTeamResponse(team);
    }

    @Transactional
    public RescueTeamMemberResponse addMemberToTeam(Long teamId, RescueTeamMemberCreateRequest request) {
        if (!teamRepository.existsById(teamId)) {
            throw new RuntimeException("Team not found");
        }

        RescueTeamMember member = RescueTeamMember.builder()
                .teamId(teamId)
                .userId(request.getUserId())
                .memberRole(request.getMemberRole())
                .status(RescueMemberStatus.AVAILABLE)
                .currentLoad(0)
                .build();

        RescueTeamMember savedMember = memberRepository.save(member);
        return mapToMemberResponse(savedMember);
    }

    public List<RescueTeamMemberResponse> getTeamMembers(Long teamId) {
        return memberRepository.findByTeamId(teamId).stream()
                .map(this::mapToMemberResponse)
                .collect(Collectors.toList());
    }

    private RescueTeamResponse mapToTeamResponse(RescueTeam team) {
        return RescueTeamResponse.builder()
                .id(team.getId())
                .name(team.getName())
                .area(team.getArea())
                .phone(team.getPhone())
                .latitude(team.getLatitude())
                .longitude(team.getLongitude())
                .status(team.getStatus())
                .leaderId(team.getLeaderId())
                .capacity(team.getCapacity())
                .currentLoad(team.getCurrentLoad())
                .createdAt(team.getCreatedAt())
                .updatedAt(team.getUpdatedAt())
                .build();
    }

    private RescueTeamMemberResponse mapToMemberResponse(RescueTeamMember member) {
        return RescueTeamMemberResponse.builder()
                .id(member.getId())
                .teamId(member.getTeamId())
                .userId(member.getUserId())
                .memberRole(member.getMemberRole())
                .status(member.getStatus())
                .currentLoad(member.getCurrentLoad())
                .latitude(member.getLatitude())
                .longitude(member.getLongitude())
                .createdAt(member.getCreatedAt())
                .updatedAt(member.getUpdatedAt())
                .build();
    }
}
