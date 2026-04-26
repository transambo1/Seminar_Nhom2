package com.stormshield.authservice.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private Long userId;
    private com.stormshield.authservice.entity.UserRole role;
    private UserResponse user;
}
