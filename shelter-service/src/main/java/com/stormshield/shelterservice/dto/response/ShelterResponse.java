package com.stormshield.shelterservice.dto.response;

import com.stormshield.shelterservice.entity.ShelterStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ShelterResponse {
    private Long id;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private Integer capacity;
    private Integer currentOccupancy;
    private ShelterStatus status;
    private String contactPhone;
    private String managedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
