package com.stormshield.authservice.service;

import com.stormshield.authservice.dto.response.AuthResponse;
import com.stormshield.authservice.dto.request.LoginRequest;
import com.stormshield.authservice.dto.request.RegisterRequest;
import com.stormshield.authservice.dto.request.InternalAccountCreateRequest;
import com.stormshield.authservice.dto.request.CreateRescueAccountRequest;
import com.stormshield.authservice.dto.response.UserResponse;
import com.stormshield.authservice.entity.User;
import com.stormshield.authservice.entity.UserRole;
import com.stormshield.authservice.entity.UserStatus;
import com.stormshield.authservice.repository.UserRepository;
import com.stormshield.authservice.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Phone number already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.CITIZEN)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        UserResponse userDto = UserResponse.builder()
                .id(savedUser.getId())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .phoneNumber(savedUser.getPhoneNumber())
                .role(savedUser.getRole())
                .status(savedUser.getStatus())
                .build();

        return AuthResponse.builder()
                .user(userDto)
                .userId(savedUser.getId())
                .role(savedUser.getRole())
                .build();
    }

    public UserResponse createInternalAccount(InternalAccountCreateRequest request) {
        if (request.getRole() == UserRole.CITIZEN) {
            throw new IllegalArgumentException("Cannot create CITIZEN role through internal endpoint");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Phone number already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        return UserResponse.builder()
                .id(savedUser.getId())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .phoneNumber(savedUser.getPhoneNumber())
                .role(savedUser.getRole())
                .status(savedUser.getStatus())
                .build();
    }

    public UserResponse createRescueAccount(CreateRescueAccountRequest request) {
        UserRole role = UserRole.RESCUE;
        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                role = UserRole.valueOf(request.getRole().toUpperCase());
                
                // Security check: Only RESCUE or RESCUE_LEADER allowed
                if (role != UserRole.RESCUE && role != UserRole.RESCUE_LEADER) {
                    throw new IllegalArgumentException("Chỉ cho phép tạo tài khoản với vai trò RESCUE hoặc RESCUE_LEADER.");
                }
            } catch (IllegalArgumentException e) {
                if (e.getMessage() != null && e.getMessage().contains("vai trò")) throw e;
                throw new IllegalArgumentException("Vai trò không hợp lệ: " + request.getRole());
            }
        }
        return createInternalAccountFromSpecificRequest(request, role);
    }

    public UserResponse createRescueMember(CreateRescueAccountRequest request) {
        // Validation: Role must be RESCUE if provided, or default to RESCUE
        UserRole role = UserRole.RESCUE;
        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                role = UserRole.valueOf(request.getRole().toUpperCase());
                if (role != UserRole.RESCUE) {
                    throw new IllegalArgumentException("Đội trưởng chỉ có quyền tạo tài khoản với vai trò RESCUE.");
                }
            } catch (IllegalArgumentException e) {
                if (e.getMessage() != null && e.getMessage().contains("quyền tạo")) throw e;
                throw new IllegalArgumentException("Vai trò không hợp lệ: " + request.getRole());
            }
        }

        // Validation: Password length
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Mật khẩu phải có ít nhất 6 ký tự.");
        }

        return createInternalAccountFromSpecificRequest(request, role);
    }


    public UserResponse createAdminAccount(CreateRescueAccountRequest request) {
        return createInternalAccountFromSpecificRequest(request, UserRole.ADMIN);
    }

    private UserResponse createInternalAccountFromSpecificRequest(CreateRescueAccountRequest request, UserRole role) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Phone number already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        return UserResponse.builder()
                .id(savedUser.getId())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .phoneNumber(savedUser.getPhoneNumber())
                .role(savedUser.getRole())
                .status(savedUser.getStatus())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new RuntimeException("User account is not active");
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        UserResponse userDto = UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .status(user.getStatus())
                .build();

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .role(user.getRole())
                .user(userDto)
                .build();
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }
}
