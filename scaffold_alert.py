import os

base_dir = r"d:\Seminar_Nhom2\alert-service"
src_main_java = os.path.join(base_dir, "src", "main", "java", "com", "stormshield", "alertservice")

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
    <artifactId>alert-service</artifactId>
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

        <!-- Database -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Swagger/OpenAPI -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>2.3.0</version>
        </dependency>

        <!-- Lombok -->
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
files[r"src\main\resources\application.properties"] = """server.port=8083
spring.application.name=alert-service

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/stormshield_alert?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=123456
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Eureka
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/

# Swagger
springdoc.api-docs.path=/v3/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
"""

# 3. Dockerfile
files["Dockerfile"] = """FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java","-jar","/app/app.jar"]
"""

# 4. Main Class
files[r"src\main\java\com\stormshield\alertservice\AlertserviceApplication.java"] = """package com.stormshield.alertservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AlertserviceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AlertserviceApplication.class, args);
    }
}
"""

# 5. Enums
files[r"src\main\java\com\stormshield\alertservice\entity\AlertType.java"] = """package com.stormshield.alertservice.entity;

public enum AlertType {
    FLOOD, STORM, LANDSLIDE, EVACUATION
}
"""

files[r"src\main\java\com\stormshield\alertservice\entity\SeverityLevel.java"] = """package com.stormshield.alertservice.entity;

public enum SeverityLevel {
    LOW, MEDIUM, HIGH, CRITICAL
}
"""

files[r"src\main\java\com\stormshield\alertservice\entity\AlertStatus.java"] = """package com.stormshield.alertservice.entity;

public enum AlertStatus {
    ACTIVE, EXPIRED, CANCELLED
}
"""

# 6. Entity
files[r"src\main\java\com\stormshield\alertservice\entity\Alert.java"] = """package com.stormshield.alertservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertType alertType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeverityLevel severityLevel;

    @Column(nullable = false)
    private String affectedArea;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Column(nullable = false)
    private String issuedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertStatus status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
"""

# 7. Repository
files[r"src\main\java\com\stormshield\alertservice\repository\AlertRepository.java"] = """package com.stormshield.alertservice.repository;

import com.stormshield.alertservice.entity.Alert;
import com.stormshield.alertservice.entity.AlertStatus;
import com.stormshield.alertservice.entity.AlertType;
import com.stormshield.alertservice.entity.SeverityLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long>, JpaSpecificationExecutor<Alert> {
    
    @Query("SELECT a FROM Alert a WHERE a.status = 'ACTIVE' AND a.startTime <= :now AND a.endTime >= :now")
    List<Alert> findActiveAndValidAlerts(LocalDateTime now);
}
"""

# 8. DTOs
files[r"src\main\java\com\stormshield\alertservice\dto\AlertRequest.java"] = """package com.stormshield.alertservice.dto;

import com.stormshield.alertservice.entity.AlertType;
import com.stormshield.alertservice.entity.SeverityLevel;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AlertRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Alert type is required")
    private AlertType alertType;

    @NotNull(message = "Severity level is required")
    private SeverityLevel severityLevel;

    @NotBlank(message = "Affected area is required")
    private String affectedArea;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    @Future(message = "End time must be in the future")
    private LocalDateTime endTime;

    @NotBlank(message = "Issued by is required")
    private String issuedBy;

    public boolean isValidTimeRange() {
        if (startTime != null && endTime != null) {
            return endTime.isAfter(startTime);
        }
        return true;
    }
}
"""

files[r"src\main\java\com\stormshield\alertservice\dto\AlertStatusRequest.java"] = """package com.stormshield.alertservice.dto;

import com.stormshield.alertservice.entity.AlertStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AlertStatusRequest {
    @NotNull(message = "Status is required")
    private AlertStatus status;
}
"""

files[r"src\main\java\com\stormshield\alertservice\dto\AlertResponse.java"] = """package com.stormshield.alertservice.dto;

import com.stormshield.alertservice.entity.AlertStatus;
import com.stormshield.alertservice.entity.AlertType;
import com.stormshield.alertservice.entity.SeverityLevel;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AlertResponse {
    private Long id;
    private String title;
    private String description;
    private AlertType alertType;
    private SeverityLevel severityLevel;
    private String affectedArea;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String issuedBy;
    private AlertStatus status;
    private LocalDateTime createdAt;
}
"""

# 9. Service
files[r"src\main\java\com\stormshield\alertservice\service\AlertService.java"] = """package com.stormshield.alertservice.service;

import com.stormshield.alertservice.dto.AlertRequest;
import com.stormshield.alertservice.dto.AlertResponse;
import com.stormshield.alertservice.dto.AlertStatusRequest;
import com.stormshield.alertservice.entity.Alert;
import com.stormshield.alertservice.entity.AlertStatus;
import com.stormshield.alertservice.entity.AlertType;
import com.stormshield.alertservice.entity.SeverityLevel;
import com.stormshield.alertservice.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final AlertRepository alertRepository;

    public AlertResponse createAlert(AlertRequest request) {
        if (!request.isValidTimeRange()) {
            throw new RuntimeException("End time must be after start time");
        }

        Alert alert = Alert.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .alertType(request.getAlertType())
                .severityLevel(request.getSeverityLevel())
                .affectedArea(request.getAffectedArea())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .issuedBy(request.getIssuedBy())
                .status(AlertStatus.ACTIVE)
                .build();

        Alert savedAlert = alertRepository.save(alert);
        
        // Placeholder publisher/service method call to trigger notification-service later
        publishAlertNotification(savedAlert);

        return mapToResponse(savedAlert);
    }

    public List<AlertResponse> getAllAlerts(AlertStatus status, AlertType type, SeverityLevel severity) {
        Specification<Alert> spec = Specification.where(null);
        
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (type != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("alertType"), type));
        }
        if (severity != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("severityLevel"), severity));
        }

        return alertRepository.findAll(spec)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public AlertResponse getAlertById(Long id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        return mapToResponse(alert);
    }

    public AlertResponse updateAlertStatus(Long id, AlertStatusRequest request) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        alert.setStatus(request.getStatus());
        return mapToResponse(alertRepository.save(alert));
    }

    public List<AlertResponse> getCurrentlyActiveAlerts() {
        return alertRepository.findActiveAndValidAlerts(LocalDateTime.now())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private void publishAlertNotification(Alert alert) {
        // TODO: In Phase 5, replace this with RabbitMQ/Kafka publisher
        // e.g., rabbitTemplate.convertAndSend("alert.exchange", "alert.new", dto);
        log.info("==> [MOCK NOTIFICATION PUBLISHER] Dispatched New Alert Notification for: {}", alert.getTitle());
    }

    private AlertResponse mapToResponse(Alert alert) {
        return AlertResponse.builder()
                .id(alert.getId())
                .title(alert.getTitle())
                .description(alert.getDescription())
                .alertType(alert.getAlertType())
                .severityLevel(alert.getSeverityLevel())
                .affectedArea(alert.getAffectedArea())
                .startTime(alert.getStartTime())
                .endTime(alert.getEndTime())
                .issuedBy(alert.getIssuedBy())
                .status(alert.getStatus())
                .createdAt(alert.getCreatedAt())
                .build();
    }
}
"""

# 10. Controller
files[r"src\main\java\com\stormshield\alertservice\controller\AlertController.java"] = """package com.stormshield.alertservice.controller;

import com.stormshield.alertservice.dto.AlertRequest;
import com.stormshield.alertservice.dto.AlertResponse;
import com.stormshield.alertservice.dto.AlertStatusRequest;
import com.stormshield.alertservice.entity.AlertStatus;
import com.stormshield.alertservice.entity.AlertType;
import com.stormshield.alertservice.entity.SeverityLevel;
import com.stormshield.alertservice.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
@Tag(name = "Emergency Alerts", description = "Endpoints for managing emergency alerts")
public class AlertController {

    private final AlertService alertService;

    @PostMapping
    @Operation(summary = "Create a new alert")
    public ResponseEntity<AlertResponse> createAlert(@Valid @RequestBody AlertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(alertService.createAlert(request));
    }

    @GetMapping
    @Operation(summary = "Get all alerts with optional filtering")
    public ResponseEntity<List<AlertResponse>> getAllAlerts(
            @RequestParam(required = false) AlertStatus status,
            @RequestParam(required = false) AlertType type,
            @RequestParam(required = false) SeverityLevel severity) {
        return ResponseEntity.ok(alertService.getAllAlerts(status, type, severity));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get alert details by ID")
    public ResponseEntity<AlertResponse> getAlertById(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.getAlertById(id));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update alert status")
    public ResponseEntity<AlertResponse> updateAlertStatus(@PathVariable Long id, @Valid @RequestBody AlertStatusRequest request) {
        return ResponseEntity.ok(alertService.updateAlertStatus(id, request));
    }

    @GetMapping("/active")
    @Operation(summary = "Get currently active and valid alerts")
    public ResponseEntity<List<AlertResponse>> getActiveAlerts() {
        return ResponseEntity.ok(alertService.getCurrentlyActiveAlerts());
    }
}
"""

# 11. Exception Handling
files[r"src\main\java\com\stormshield\alertservice\exception\GlobalExceptionHandler.java"] = """package com.stormshield.alertservice.exception;

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

for partial_path, content in files.items():
    full_path = os.path.join(base_dir, partial_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Alert service generated successfully")
