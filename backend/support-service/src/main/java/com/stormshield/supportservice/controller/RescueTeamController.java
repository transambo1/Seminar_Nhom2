package com.stormshield.supportservice.controller;

import com.stormshield.supportservice.dto.request.RescueTeamCreateRequest;
import com.stormshield.supportservice.dto.request.RescueTeamMemberCreateRequest;
import com.stormshield.supportservice.dto.response.RescueTeamMemberResponse;
import com.stormshield.supportservice.dto.response.RescueTeamResponse;
import com.stormshield.supportservice.service.RescueTeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rescue-teams")
@RequiredArgsConstructor
@Tag(name = "Rescue Team Management", description = "Endpoints for managing rescue teams and members")
public class RescueTeamController {

    private final RescueTeamService teamService;

    @PostMapping
    @Operation(summary = "Create a new rescue team")
    public ResponseEntity<RescueTeamResponse> createTeam(@Valid @RequestBody RescueTeamCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teamService.createTeam(request));
    }

    @GetMapping
    @Operation(summary = "Get all rescue teams")
    public ResponseEntity<List<RescueTeamResponse>> getAllTeams() {
        return ResponseEntity.ok(teamService.getAllTeams());
    }

    @GetMapping("/my-team")
    @Operation(summary = "Get current leader's team")
    public ResponseEntity<RescueTeamResponse> getMyTeam(
            @RequestHeader(value = "X-User-Id") Long leaderId) {
        return ResponseEntity.ok(teamService.getTeamByLeaderId(leaderId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get rescue team by ID")
    public ResponseEntity<RescueTeamResponse> getTeamById(@PathVariable Long id) {
        return ResponseEntity.ok(teamService.getTeamById(id));
    }

    @GetMapping("/leader/{leaderId}")
    @Operation(summary = "Get rescue team by Leader ID")
    public ResponseEntity<RescueTeamResponse> getTeamByLeaderId(@PathVariable Long leaderId) {
        return ResponseEntity.ok(teamService.getTeamByLeaderId(leaderId));
    }

    @PostMapping("/{id}/members")
    @Operation(summary = "Add a member to a rescue team")
    public ResponseEntity<RescueTeamMemberResponse> addMember(
            @PathVariable Long id,
            @Valid @RequestBody RescueTeamMemberCreateRequest request,
            @RequestHeader(value = "X-User-Id") Long userId,
            @RequestHeader(value = "X-User-Role") String userRole) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teamService.addMemberToTeam(id, request, userId, userRole));
    }

    @GetMapping("/{id}/members")
    @Operation(summary = "Get all members of a rescue team")
    public ResponseEntity<List<RescueTeamMemberResponse>> getMembers(@PathVariable Long id) {
        return ResponseEntity.ok(teamService.getTeamMembers(id));
    }

    @DeleteMapping("/{id}/members/{userId}")
    @Operation(summary = "Remove a member from a rescue team")
    public ResponseEntity<Void> removeMember(@PathVariable Long id, @PathVariable Long userId) {
        teamService.removeMemberFromTeam(id, userId);
        return ResponseEntity.noContent().build();
    }
}
