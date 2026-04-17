package com.stormshield.supportservice.service;

import com.stormshield.supportservice.dto.RescueRequestResponse;
import com.stormshield.supportservice.dto.SupportRequestAssign;
import com.stormshield.supportservice.dto.SupportRequestCreate;
import com.stormshield.supportservice.dto.SupportRequestStatusUpdate;
import com.stormshield.supportservice.entity.PriorityLevel;
import com.stormshield.supportservice.entity.RequestStatus;
import com.stormshield.supportservice.entity.RequestType;
import com.stormshield.supportservice.entity.RescueRequest;
import com.stormshield.supportservice.repository.RescueRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class RescueRequestService {

    private final RescueRequestRepository repository;

    public RescueRequestResponse createRequest(SupportRequestCreate request) {
        RescueRequest rescueRequest = RescueRequest.builder()
                .userId(request.getUserId())
                .requestType(request.getRequestType())
                .description(request.getDescription())
                .numberOfPeople(request.getNumberOfPeople())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .priorityLevel(request.getPriorityLevel())
                .status(RequestStatus.PENDING)
                .build();

        RescueRequest saved = repository.save(rescueRequest);
        publishNotification(saved, "CREATED");
        return mapToResponse(saved);
    }

    public List<RescueRequestResponse> getMyRequests(Long userId) {
        return repository.findByUserId(userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public RescueRequestResponse getRequestById(Long id) {
        return mapToResponse(repository.findById(id).orElseThrow(() -> new RuntimeException("Request not found")));
    }

    public List<RescueRequestResponse> getAllRequests(RequestStatus status, PriorityLevel priority, RequestType type) {
        Specification<RescueRequest> spec = Specification.where(null);
        if (status != null) spec = spec.and((rt, q, cb) -> cb.equal(rt.get("status"), status));
        if (priority != null) spec = spec.and((rt, q, cb) -> cb.equal(rt.get("priorityLevel"), priority));
        if (type != null) spec = spec.and((rt, q, cb) -> cb.equal(rt.get("requestType"), type));

        return repository.findAll(spec).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<RescueRequestResponse> getRequestsByStatus(RequestStatus status) {
        return repository.findByStatus(status).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public RescueRequestResponse assignTeam(Long id, SupportRequestAssign assignDto) {
        RescueRequest req = repository.findById(id).orElseThrow(() -> new RuntimeException("Request not found"));
        
        if (req.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Can only assign a team to a PENDING request");
        }
        
        req.setAssignedTeamId(assignDto.getAssignedTeamId());
        req.setStatus(RequestStatus.ASSIGNED);
        
        RescueRequest updated = repository.save(req);
        publishNotification(updated, "ASSIGNED");
        return mapToResponse(updated);
    }

    public RescueRequestResponse updateStatus(Long id, SupportRequestStatusUpdate updateDto) {
        RescueRequest req = repository.findById(id).orElseThrow(() -> new RuntimeException("Request not found"));
        RequestStatus oldStatus = req.getStatus();
        RequestStatus newStatus = updateDto.getStatus();
        
        validateStatusTransition(oldStatus, newStatus);
        
        req.setStatus(newStatus);
        RescueRequest updated = repository.save(req);
        publishNotification(updated, "STATUS_UPDATED");
        return mapToResponse(updated);
    }

    private void validateStatusTransition(RequestStatus oldStatus, RequestStatus newStatus) {
        if (oldStatus == newStatus) return;

        switch (oldStatus) {
            case PENDING:
                if (newStatus != RequestStatus.ASSIGNED && newStatus != RequestStatus.CANCELLED)
                    throw new IllegalStateException("PENDING can only transition to ASSIGNED or CANCELLED");
                break;
            case ASSIGNED:
                if (newStatus != RequestStatus.IN_PROGRESS && newStatus != RequestStatus.CANCELLED)
                    throw new IllegalStateException("ASSIGNED can only transition to IN_PROGRESS or CANCELLED");
                break;
            case IN_PROGRESS:
                if (newStatus != RequestStatus.RESOLVED)
                    throw new IllegalStateException("IN_PROGRESS can only transition to RESOLVED");
                break;
            case RESOLVED:
            case CANCELLED:
                throw new IllegalStateException("RESOLVED and CANCELLED are terminal states");
        }
    }

    private void publishNotification(RescueRequest request, String eventAction) {
        log.info("==> [MOCK NOTIFICATION PUBLISHER] Support Request ID {} {}, current status: {}", 
            request.getId(), eventAction, request.getStatus());
    }

    private RescueRequestResponse mapToResponse(RescueRequest r) {
        return RescueRequestResponse.builder()
                .id(r.getId()).userId(r.getUserId())
                .requestType(r.getRequestType()).description(r.getDescription())
                .numberOfPeople(r.getNumberOfPeople())
                .latitude(r.getLatitude()).longitude(r.getLongitude())
                .priorityLevel(r.getPriorityLevel()).status(r.getStatus())
                .assignedTeamId(r.getAssignedTeamId())
                .createdAt(r.getCreatedAt()).updatedAt(r.getUpdatedAt())
                .build();
    }
}
