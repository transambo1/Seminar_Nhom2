package com.stormshield.supportservice.controller;

import com.stormshield.supportservice.dto.response.RescueRequestResponse;
import com.stormshield.supportservice.dto.request.SupportAssignRequest;
import com.stormshield.supportservice.dto.request.SupportCreateRequest;
import com.stormshield.supportservice.dto.request.SupportRequestFilterRequest;
import com.stormshield.supportservice.dto.request.SupportStatusUpdateRequest;
import com.stormshield.supportservice.entity.PriorityLevel;
import com.stormshield.supportservice.entity.RequestStatus;
import com.stormshield.supportservice.entity.RequestType;
import com.stormshield.supportservice.service.RescueRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/support-requests")
@RequiredArgsConstructor
@Tag(name = "Support / Rescue Requests", description = "Endpoints for managing emergency rescue requests")
public class RescueRequestController {

    private final RescueRequestService rescueService;

    @PostMapping
    @Operation(summary = "Create new rescue/support request")
    public ResponseEntity<RescueRequestResponse> createRequest(@Valid @RequestBody SupportCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rescueService.createRequest(request));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current user's own requests (Mock headers used)")
    public ResponseEntity<List<RescueRequestResponse>> getMyRequests(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(rescueService.getMyRequests(userId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get request detail")
    public ResponseEntity<RescueRequestResponse> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(rescueService.getRequestById(id));
    }

    @GetMapping
    @Operation(summary = "Admin/rescuer gets all requests with optional filters")
    public ResponseEntity<List<RescueRequestResponse>> getAllRequests(
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(required = false) PriorityLevel priorityLevel,
            @RequestParam(required = false) RequestType requestType) {
        return ResponseEntity.ok(rescueService.getAllRequests(status, priorityLevel, requestType));
    }

    @GetMapping("/filter")
@Operation(summary = "Advanced filter with scope, sorting, and distance calculation")
public ResponseEntity<List<RescueRequestResponse>> filterRequests(
        @ModelAttribute SupportRequestFilterRequest request,
        @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {

    System.out.println(">>> HIT /filter controller");
    System.out.println(">>> request = " + request);
    System.out.println(">>> userId = " + userId);

    request.setUserId(userId);
    return ResponseEntity.ok(rescueService.filterRequests(request));
}

    @GetMapping("/status/{status}")
    @Operation(summary = "Get requests by specific status")
    public ResponseEntity<List<RescueRequestResponse>> getRequestsByStatus(@PathVariable RequestStatus status) {
        return ResponseEntity.ok(rescueService.getRequestsByStatus(status));
    }

    @PatchMapping("/{id}/assign")
    @Operation(summary = "Assign request to team/rescuer")
    public ResponseEntity<RescueRequestResponse> assignTeam(@PathVariable Long id,
            @Valid @RequestBody SupportAssignRequest request) {
        return ResponseEntity.ok(rescueService.assignTeam(id, request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update request status")
    public ResponseEntity<RescueRequestResponse> updateStatus(@PathVariable Long id,
            @Valid @RequestBody SupportStatusUpdateRequest request) {
        return ResponseEntity.ok(rescueService.updateStatus(id, request));
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get overall support requests statistics")
    public ResponseEntity<com.stormshield.supportservice.dto.response.SupportStatisticsResponse> getStatistics() {
        return ResponseEntity.ok(rescueService.getStatistics());
    }
}
