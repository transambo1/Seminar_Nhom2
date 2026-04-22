package com.stormshield.notificationservice.controller;

import com.stormshield.notificationservice.dto.request.NotificationCreateRequest;
import com.stormshield.notificationservice.dto.response.NotificationResponse;
import com.stormshield.notificationservice.dto.response.UnreadCountResponse;
import com.stormshield.notificationservice.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "User Notifications", description = "Endpoints for managing system and emergency notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/internal")
    @Operation(summary = "Internal endpoint to create and push a notification")
    public ResponseEntity<NotificationResponse> createNotification(@Valid @RequestBody NotificationCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(notificationService.createNotification(request));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current user's notifications (DESC order)")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark a single notification as read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read for current user")
    public ResponseEntity<Void> markAllAsRead(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get total unread notification count for badge display")
    public ResponseEntity<UnreadCountResponse> getUnreadCount(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }
}
