package com.stormshield.supportservice.dto.request;

import com.stormshield.supportservice.entity.RescueMemberRole;
import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class RescueTeamMemberCreateRequest {
    @NotNull(message = "User ID is required")
    private Long userId;

    private RescueMemberRole memberRole = RescueMemberRole.MEMBER;
}
