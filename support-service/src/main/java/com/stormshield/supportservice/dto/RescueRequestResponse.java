package com.stormshield.supportservice.dto;

import com.stormshield.supportservice.entity.PriorityLevel;
import com.stormshield.supportservice.entity.RequestStatus;
import com.stormshield.supportservice.entity.RequestType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RescueRequestResponse {
    private Long id;
    private Long userId;
    private RequestType requestType;
    private String description;
    private Integer numberOfPeople;
    private Double latitude;
    private Double longitude;
    private PriorityLevel priorityLevel;
    private RequestStatus status;
    private Long assignedTeamId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
