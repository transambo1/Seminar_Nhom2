package com.stormshield.authservice.dto;

import com.stormshield.authservice.entity.UserRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDto {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private UserRole role;
}
