package com.stormshield.authservice.controller;

import com.stormshield.authservice.dto.response.AuthResponse;
import com.stormshield.authservice.dto.request.LoginRequest;
import com.stormshield.authservice.dto.request.RegisterRequest;
import com.stormshield.authservice.dto.request.InternalAccountCreateRequest;
import com.stormshield.authservice.dto.request.CreateRescueAccountRequest;
import com.stormshield.authservice.dto.response.UserResponse;
import com.stormshield.authservice.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user registration and login")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and get JWT")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current logged-in user info")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(authService.getCurrentUser(authentication.getName()));
    }

    @PostMapping("/internal/accounts")
    @Operation(summary = "Create internal accounts (RESCUE, ADMIN) - Admin only")
    public ResponseEntity<UserResponse> createInternalAccount(@Valid @RequestBody InternalAccountCreateRequest request) {
        return ResponseEntity.ok(authService.createInternalAccount(request));
    }

    @PostMapping("/admin/rescue-accounts")
    @Operation(summary = "Create rescue accounts - Admin only")
    public ResponseEntity<UserResponse> createRescueAccount(@Valid @RequestBody CreateRescueAccountRequest request) {
        return ResponseEntity.ok(authService.createRescueAccount(request));
    }

    @PostMapping("/admin/admin-accounts")
    @Operation(summary = "Create admin accounts - Admin only")
    public ResponseEntity<UserResponse> createAdminAccount(@Valid @RequestBody CreateRescueAccountRequest request) {
        return ResponseEntity.ok(authService.createAdminAccount(request));
    }
}
