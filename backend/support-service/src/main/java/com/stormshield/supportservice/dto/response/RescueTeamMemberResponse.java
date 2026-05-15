package com.stormshield.supportservice.dto.response;

import com.stormshield.supportservice.entity.RescueMemberRole;
import com.stormshield.supportservice.entity.RescueMemberStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class RescueTeamMemberResponse {
    private Long id;
    private Long teamId;
    private Long userId;
    private RescueMemberRole memberRole;
    private RescueMemberStatus status;
    private Integer currentLoad;
    private Double latitude;
    private Double longitude;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
