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
    private String phoneNumber;
    private UserRole role;
}
