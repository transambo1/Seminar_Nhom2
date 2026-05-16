package com.stormshield.supportservice.dto.response;

import com.stormshield.supportservice.entity.RescueTeamStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class RescueTeamResponse {
    private Long id;
    private String name;
    private String area;
    private String phone;
    private Double latitude;
    private Double longitude;
    private RescueTeamStatus status;
    private Long leaderId;
    private Integer capacity;
    private Integer currentLoad;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
