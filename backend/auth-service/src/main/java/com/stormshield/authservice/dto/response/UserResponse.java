package com.stormshield.authservice.dto.response;

import com.stormshield.authservice.entity.UserRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    @com.fasterxml.jackson.annotation.JsonProperty("phone")
    private String phoneNumber;
    private UserRole role;
    private com.stormshield.authservice.entity.UserStatus status;
}
