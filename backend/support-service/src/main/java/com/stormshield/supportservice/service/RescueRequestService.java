package com.stormshield.supportservice.service;

import com.stormshield.supportservice.dto.response.RescueRequestResponse;
import com.stormshield.supportservice.dto.request.SupportAssignRequest;
import com.stormshield.supportservice.dto.request.SupportCreateRequest;
import com.stormshield.supportservice.dto.request.SupportRequestFilterRequest;
import com.stormshield.supportservice.dto.request.SupportStatusUpdateRequest;
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
    private final NotificationEventPublisher eventPublisher;

    public RescueRequestResponse createRequest(SupportCreateRequest request) {
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
        if (status != null)
            spec = spec.and((rt, q, cb) -> cb.equal(rt.get("status"), status));
        if (priority != null)
            spec = spec.and((rt, q, cb) -> cb.equal(rt.get("priorityLevel"), priority));
        if (type != null)
            spec = spec.and((rt, q, cb) -> cb.equal(rt.get("requestType"), type));

        return repository.findAll(spec).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<RescueRequestResponse> getRequestsByStatus(RequestStatus status) {
        return repository.findByStatus(status).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public RescueRequestResponse assignTeam(Long id, SupportAssignRequest assignDto) {
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

    public RescueRequestResponse updateStatus(Long id, SupportStatusUpdateRequest updateDto) {
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
        if (oldStatus == newStatus)
            return;

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
        log.info("==> [NOTIFY] Support Request ID {} {}, current status: {}",
                request.getId(), eventAction, request.getStatus());
        
        String eventType = "";
        String routingKey = "";
        String title = "";
        String message = "";
        Long recipientId = request.getUserId();

        switch (eventAction) {
            case "CREATED":
                eventType = "SUPPORT_REQUEST_CREATED";
                routingKey = "support.request.created";
                title = "Yêu cầu cứu trợ mới";
                message = String.format("Yêu cầu cứu trợ %s (%s) đã được tạo tại %s.", 
                        request.getRequestType(), request.getPriorityLevel(), request.getDescription());
                // For CREATED, usually we notify Admins or Rescue teams. 
                // For MVP, I'll send to user itself or a demo admin (e.g. ID 1)
                recipientId = 1L; 
                break;
            case "ASSIGNED":
                eventType = "RESCUE_ASSIGNED";
                routingKey = "support.rescue.assigned";
                title = "Đội cứu hộ đã nhận yêu cầu";
                message = String.format("Yêu cầu cứu trợ của bạn đã được đội cứu hộ (ID: %d) tiếp nhận.", 
                        request.getAssignedTeamId());
                break;
            case "STATUS_UPDATED":
                eventType = "SUPPORT_STATUS_UPDATED";
                routingKey = "support.status.updated";
                title = "Yêu cầu cứu trợ đã được cập nhật";
                message = String.format("Yêu cầu cứu trợ của bạn đã chuyển sang trạng thái: %s.", 
                        request.getStatus());
                break;
        }

        if (!eventType.isEmpty()) {
            eventPublisher.publishEvent(eventType, recipientId, title, message, String.valueOf(request.getId()), routingKey);
        }
    }

    public List<RescueRequestResponse> filterRequests(SupportRequestFilterRequest request) {

        Specification<RescueRequest> spec = request.specification();
List<RescueRequest> list = repository.findAll(spec);

String normalizedSortBy = request.getSortBy() == null ? "CREATED_AT" : request.getSortBy().toUpperCase();
String normalizedDirection = request.getDirection() == null ? "DESC" : request.getDirection().toUpperCase();

boolean isAsc = "ASC".equals(normalizedDirection);
Double userLat = request.getUserLat();
Double userLng = request.getUserLng();

        if ("DISTANCE".equals(normalizedSortBy)) {
            if (userLat == null || userLng == null) {
                throw new IllegalArgumentException("userLat and userLng are required when sortBy=DISTANCE");
            }

            list.sort((r1, r2) -> {
                double d1 = calculateDistance(userLat, userLng, r1.getLatitude(), r1.getLongitude());
                double d2 = calculateDistance(userLat, userLng, r2.getLatitude(), r2.getLongitude());
                return isAsc ? Double.compare(d1, d2) : Double.compare(d2, d1);
            });
        } else {
            list.sort((r1, r2) -> {
                java.time.LocalDateTime t1 = r1.getCreatedAt();
                java.time.LocalDateTime t2 = r2.getCreatedAt();
                if (t1 == null || t2 == null)
                    return 0;
                return isAsc ? t1.compareTo(t2) : t2.compareTo(t1);
            });
        }

        return list.stream().map(r -> {
            RescueRequestResponse res = mapToResponse(r);
            if (userLat != null && userLng != null && r.getLatitude() != null && r.getLongitude() != null) {
                res.setDistance(calculateDistance(userLat, userLng, r.getLatitude(), r.getLongitude()));
            }
            return res;
        }).collect(Collectors.toList());
    }

    private double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null)
            return Double.MAX_VALUE;
        final int R = 6371; // km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c * 1000;
    }

    public com.stormshield.supportservice.dto.response.SupportStatisticsResponse getStatistics() {
        return com.stormshield.supportservice.dto.response.SupportStatisticsResponse.builder()
                .totalRequests(repository.count())
                .pendingRequests(repository.countByStatus(RequestStatus.PENDING))
                .assignedRequests(repository.countByStatus(RequestStatus.ASSIGNED))
                .inProgressRequests(repository.countByStatus(RequestStatus.IN_PROGRESS))
                .resolvedRequests(repository.countByStatus(RequestStatus.RESOLVED))
                .cancelledRequests(repository.countByStatus(RequestStatus.CANCELLED))
                .build();
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
