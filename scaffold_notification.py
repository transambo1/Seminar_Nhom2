import os

base_dir = r"d:\Seminar_Nhom2\notification-service"
src_main_java = os.path.join(base_dir, "src", "main", "java", "com", "stormshield", "notificationservice")

files = {}

# 1. pom.xml
files["pom.xml"] = """<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.3</version>
        <relativePath/>
    </parent>
    <groupId>com.stormshield</groupId>
    <artifactId>notification-service</artifactId>
    <version>1.0.0-SNAPSHOT</version>

    <properties>
        <java.version>17</java.version>
        <spring-cloud.version>2023.0.0</spring-cloud.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>

        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>

        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>2.3.0</version>
        </dependency>

        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
"""

# 2. application.properties
files[r"src\main\resources\application.properties"] = """server.port=8086
spring.application.name=notification-service

spring.datasource.url=jdbc:mysql://localhost:3306/stormshield_notification?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=123456
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

eureka.client.service-url.defaultZone=http://localhost:8761/eureka/

springdoc.api-docs.path=/v3/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
"""

# 3. Dockerfile
files["Dockerfile"] = """FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8086
ENTRYPOINT ["java","-jar","/app/app.jar"]
"""

# 4. Main Class
files[r"src\main\java\com\stormshield\notificationservice\NotificationserviceApplication.java"] = """package com.stormshield.notificationservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class NotificationserviceApplication {
    public static void main(String[] args) {
        SpringApplication.run(NotificationserviceApplication.class, args);
    }
}
"""

# 5. Enums
files[r"src\main\java\com\stormshield\notificationservice\entity\NotificationType.java"] = """package com.stormshield.notificationservice.entity;

public enum NotificationType {
    ALERT, SUPPORT_UPDATE, SYSTEM
}
"""

# 6. Entity
files[r"src\main\java\com\stormshield\notificationservice\entity\Notification.java"] = """package com.stormshield.notificationservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType notificationType;

    private Long relatedEntityId;

    @Column(nullable = false)
    private Boolean isRead;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime sentAt;
}
"""

# 7. Repository
files[r"src\main\java\com\stormshield\notificationservice\repository\NotificationRepository.java"] = """package com.stormshield.notificationservice.repository;

import com.stormshield.notificationservice.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByUserIdOrderBySentAtDesc(Long userId);
    
    long countByUserIdAndIsReadFalse(Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId AND n.isRead = false")
    void markAllAsReadByUserId(Long userId);
}
"""

# 8. DTOs
files[r"src\main\java\com\stormshield\notificationservice\dto\NotificationCreateRequest.java"] = """package com.stormshield.notificationservice.dto;

import com.stormshield.notificationservice.entity.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NotificationCreateRequest {
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    @NotNull(message = "Notification type is required")
    private NotificationType notificationType;

    private Long relatedEntityId;
}
"""

files[r"src\main\java\com\stormshield\notificationservice\dto\NotificationResponse.java"] = """package com.stormshield.notificationservice.dto;

import com.stormshield.notificationservice.entity.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private Long userId;
    private String title;
    private String message;
    private NotificationType notificationType;
    private Long relatedEntityId;
    private Boolean isRead;
    private LocalDateTime sentAt;
}
"""

files[r"src\main\java\com\stormshield\notificationservice\dto\UnreadCountResponse.java"] = """package com.stormshield.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UnreadCountResponse {
    private Long userId;
    private long unreadCount;
}
"""

# 9. Exception Handling
files[r"src\main\java\com\stormshield\notificationservice\exception\GlobalExceptionHandler.java"] = """package com.stormshield.notificationservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }
}
"""

# 10. Service
files[r"src\main\java\com\stormshield\notificationservice\service\NotificationService.java"] = """package com.stormshield.notificationservice.service;

import com.stormshield.notificationservice.dto.NotificationCreateRequest;
import com.stormshield.notificationservice.dto.NotificationResponse;
import com.stormshield.notificationservice.dto.UnreadCountResponse;
import com.stormshield.notificationservice.entity.Notification;
import com.stormshield.notificationservice.repository.NotificationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationResponse createNotification(NotificationCreateRequest request) {
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .title(request.getTitle())
                .message(request.getMessage())
                .notificationType(request.getNotificationType())
                .relatedEntityId(request.getRelatedEntityId())
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("Mocking Push Notification Dispatched -> Firebase/APNS for User {}", saved.getUserId());
        
        return mapToResponse(saved);
    }

    public List<NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderBySentAtDesc(userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public NotificationResponse markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        return mapToResponse(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    public UnreadCountResponse getUnreadCount(Long userId) {
        long count = notificationRepository.countByUserIdAndIsReadFalse(userId);
        return new UnreadCountResponse(userId, count);
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId()).userId(n.getUserId())
                .title(n.getTitle()).message(n.getMessage())
                .notificationType(n.getNotificationType())
                .relatedEntityId(n.getRelatedEntityId())
                .isRead(n.getIsRead()).sentAt(n.getSentAt())
                .build();
    }
}
"""

# 11. Controller
files[r"src\main\java\com\stormshield\notificationservice\controller\NotificationController.java"] = """package com.stormshield.notificationservice.controller;

import com.stormshield.notificationservice.dto.NotificationCreateRequest;
import com.stormshield.notificationservice.dto.NotificationResponse;
import com.stormshield.notificationservice.dto.UnreadCountResponse;
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
"""

for partial_path, content in files.items():
    full_path = os.path.join(base_dir, partial_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Notification service generated successfully")
