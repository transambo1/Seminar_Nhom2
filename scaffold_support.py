import os

base_dir = r"d:\Seminar_Nhom2\support-service"
src_main_java = os.path.join(base_dir, "src", "main", "java", "com", "stormshield", "supportservice")

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
    <artifactId>support-service</artifactId>
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
files[r"src\main\resources\application.properties"] = """server.port=8085
spring.application.name=support-service

spring.datasource.url=jdbc:mysql://localhost:3306/stormshield_support?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
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
EXPOSE 8085
ENTRYPOINT ["java","-jar","/app/app.jar"]
"""

# 4. Main Class
files[r"src\main\java\com\stormshield\supportservice\SupportserviceApplication.java"] = """package com.stormshield.supportservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SupportserviceApplication {
    public static void main(String[] args) {
        SpringApplication.run(SupportserviceApplication.class, args);
    }
}
"""

# 5. Enums
files[r"src\main\java\com\stormshield\supportservice\entity\RequestType.java"] = """package com.stormshield.supportservice.entity;

public enum RequestType {
    MEDICAL, FOOD, EVACUATION, RESCUE
}
"""

files[r"src\main\java\com\stormshield\supportservice\entity\PriorityLevel.java"] = """package com.stormshield.supportservice.entity;

public enum PriorityLevel {
    NORMAL, URGENT, CRITICAL
}
"""

files[r"src\main\java\com\stormshield\supportservice\entity\RequestStatus.java"] = """package com.stormshield.supportservice.entity;

public enum RequestStatus {
    PENDING, ASSIGNED, IN_PROGRESS, RESOLVED, CANCELLED
}
"""

# 6. Entity
files[r"src\main\java\com\stormshield\supportservice\entity\RescueRequest.java"] = """package com.stormshield.supportservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "rescue_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescueRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestType requestType;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false)
    private Integer numberOfPeople;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PriorityLevel priorityLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status;

    private Long assignedTeamId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
"""

# 7. Repository
files[r"src\main\java\com\stormshield\supportservice\repository\RescueRequestRepository.java"] = """package com.stormshield.supportservice.repository;

import com.stormshield.supportservice.entity.RescueRequest;
import com.stormshield.supportservice.entity.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RescueRequestRepository extends JpaRepository<RescueRequest, Long>, JpaSpecificationExecutor<RescueRequest> {
    List<RescueRequest> findByUserId(Long userId);
    List<RescueRequest> findByStatus(RequestStatus status);
}
"""

# 8. DTOs
files[r"src\main\java\com\stormshield\supportservice\dto\SupportRequestCreate.java"] = """package com.stormshield.supportservice.dto;

import com.stormshield.supportservice.entity.PriorityLevel;
import com.stormshield.supportservice.entity.RequestType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class SupportRequestCreate {
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Request type is required")
    private RequestType requestType;

    @NotBlank(message = "Description cannot be blank")
    private String description;

    @NotNull(message = "Number of people is required")
    @Min(value = 1, message = "Number of people must be at least 1")
    private Integer numberOfPeople;

    @NotNull(message = "Latitude is required")
    @Min(-90) @Max(90)
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @Min(-180) @Max(180)
    private Double longitude;

    @NotNull(message = "Priority level is required")
    private PriorityLevel priorityLevel;
}
"""

files[r"src\main\java\com\stormshield\supportservice\dto\SupportRequestAssign.java"] = """package com.stormshield.supportservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SupportRequestAssign {
    @NotNull(message = "Assigned team/rescuer ID is required")
    private Long assignedTeamId;
}
"""

files[r"src\main\java\com\stormshield\supportservice\dto\SupportRequestStatusUpdate.java"] = """package com.stormshield.supportservice.dto;

import com.stormshield.supportservice.entity.RequestStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SupportRequestStatusUpdate {
    @NotNull(message = "Status cannot be null")
    private RequestStatus status;
}
"""

files[r"src\main\java\com\stormshield\supportservice\dto\RescueRequestResponse.java"] = """package com.stormshield.supportservice.dto;

import com.stormshield.supportservice.entity.PriorityLevel;
import com.stormshield.supportservice.entity.RequestStatus;
import com.stormshield.supportservice.entity.RequestType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RescueRequestResponse {
    private Long id;
    private Long userId;
    private RequestType requestType;
    private String description;
    private Integer numberOfPeople;
    private Double latitude;
    private Double longitude;
    private PriorityLevel priorityLevel;
    private RequestStatus status;
    private Long assignedTeamId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
"""

# 9. Exception Handling
files[r"src\main\java\com\stormshield\supportservice\exception\GlobalExceptionHandler.java"] = """package com.stormshield.supportservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalStateException(IllegalStateException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

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
files[r"src\main\java\com\stormshield\supportservice\service\RescueRequestService.java"] = """package com.stormshield.supportservice.service;

import com.stormshield.supportservice.dto.RescueRequestResponse;
import com.stormshield.supportservice.dto.SupportRequestAssign;
import com.stormshield.supportservice.dto.SupportRequestCreate;
import com.stormshield.supportservice.dto.SupportRequestStatusUpdate;
import com.stormshield.supportservice.entity.PriorityLevel;
import com.stormshield.supportservice.entity.RequestStatus;
import com.stormshield.supportservice.entity.RequestType;
import com.stormshield.supportservice.entity.RescueRequest;
import com.stormshield.supportservice.repository.RescueRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RescueRequestService {

    private final RescueRequestRepository repository;

    public RescueRequestResponse createRequest(SupportRequestCreate request) {
        RescueRequest rescueRequest = RescueRequest.builder()
                .userId(request.getUserId())
                .requestType(request.getRequestType())
                .description(request.getDescription())
                .numberOfPeople(request.getNumberOfPeople())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .priorityLevel(request.getPriorityLevel())
                .status(RequestStatus.PENDING)
                .build();

        RescueRequest saved = repository.save(rescueRequest);
        publishNotification(saved, "CREATED");
        return mapToResponse(saved);
    }

    public List<RescueRequestResponse> getMyRequests(Long userId) {
        return repository.findByUserId(userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public RescueRequestResponse getRequestById(Long id) {
        return mapToResponse(repository.findById(id).orElseThrow(() -> new RuntimeException("Request not found")));
    }

    public List<RescueRequestResponse> getAllRequests(RequestStatus status, PriorityLevel priority, RequestType type) {
        Specification<RescueRequest> spec = Specification.where(null);
        if (status != null) spec = spec.and((rt, q, cb) -> cb.equal(rt.get("status"), status));
        if (priority != null) spec = spec.and((rt, q, cb) -> cb.equal(rt.get("priorityLevel"), priority));
        if (type != null) spec = spec.and((rt, q, cb) -> cb.equal(rt.get("requestType"), type));

        return repository.findAll(spec).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<RescueRequestResponse> getRequestsByStatus(RequestStatus status) {
        return repository.findByStatus(status).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public RescueRequestResponse assignTeam(Long id, SupportRequestAssign assignDto) {
        RescueRequest req = repository.findById(id).orElseThrow(() -> new RuntimeException("Request not found"));
        
        if (req.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Can only assign a team to a PENDING request");
        }
        
        req.setAssignedTeamId(assignDto.getAssignedTeamId());
        req.setStatus(RequestStatus.ASSIGNED);
        
        RescueRequest updated = repository.save(req);
        publishNotification(updated, "ASSIGNED");
        return mapToResponse(updated);
    }

    public RescueRequestResponse updateStatus(Long id, SupportRequestStatusUpdate updateDto) {
        RescueRequest req = repository.findById(id).orElseThrow(() -> new RuntimeException("Request not found"));
        RequestStatus oldStatus = req.getStatus();
        RequestStatus newStatus = updateDto.getStatus();
        
        validateStatusTransition(oldStatus, newStatus);
        
        req.setStatus(newStatus);
        RescueRequest updated = repository.save(req);
        publishNotification(updated, "STATUS_UPDATED");
        return mapToResponse(updated);
    }

    private void validateStatusTransition(RequestStatus oldStatus, RequestStatus newStatus) {
        if (oldStatus == newStatus) return;

        switch (oldStatus) {
            case PENDING:
                if (newStatus != RequestStatus.ASSIGNED && newStatus != RequestStatus.CANCELLED)
                    throw new IllegalStateException("PENDING can only transition to ASSIGNED or CANCELLED");
                break;
            case ASSIGNED:
                if (newStatus != RequestStatus.IN_PROGRESS && newStatus != RequestStatus.CANCELLED)
                    throw new IllegalStateException("ASSIGNED can only transition to IN_PROGRESS or CANCELLED");
                break;
            case IN_PROGRESS:
                if (newStatus != RequestStatus.RESOLVED)
                    throw new IllegalStateException("IN_PROGRESS can only transition to RESOLVED");
                break;
            case RESOLVED:
            case CANCELLED:
                throw new IllegalStateException("RESOLVED and CANCELLED are terminal states");
        }
    }

    private void publishNotification(RescueRequest request, String eventAction) {
        log.info("==> [MOCK NOTIFICATION PUBLISHER] Support Request ID {} {}, current status: {}", 
            request.getId(), eventAction, request.getStatus());
    }

    private RescueRequestResponse mapToResponse(RescueRequest r) {
        return RescueRequestResponse.builder()
                .id(r.getId()).userId(r.getUserId())
                .requestType(r.getRequestType()).description(r.getDescription())
                .numberOfPeople(r.getNumberOfPeople())
                .latitude(r.getLatitude()).longitude(r.getLongitude())
                .priorityLevel(r.getPriorityLevel()).status(r.getStatus())
                .assignedTeamId(r.getAssignedTeamId())
                .createdAt(r.getCreatedAt()).updatedAt(r.getUpdatedAt())
                .build();
    }
}
"""

# 11. Controller
files[r"src\main\java\com\stormshield\supportservice\controller\RescueRequestController.java"] = """package com.stormshield.supportservice.controller;

import com.stormshield.supportservice.dto.RescueRequestResponse;
import com.stormshield.supportservice.dto.SupportRequestAssign;
import com.stormshield.supportservice.dto.SupportRequestCreate;
import com.stormshield.supportservice.dto.SupportRequestStatusUpdate;
import com.stormshield.supportservice.entity.PriorityLevel;
import com.stormshield.supportservice.entity.RequestStatus;
import com.stormshield.supportservice.entity.RequestType;
import com.stormshield.supportservice.service.RescueRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/support-requests")
@RequiredArgsConstructor
@Tag(name = "Support / Rescue Requests", description = "Endpoints for managing emergency rescue requests")
public class RescueRequestController {

    private final RescueRequestService rescueService;

    @PostMapping
    @Operation(summary = "Create new rescue/support request")
    public ResponseEntity<RescueRequestResponse> createRequest(@Valid @RequestBody SupportRequestCreate request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rescueService.createRequest(request));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current user's own requests (Mock headers used)")
    public ResponseEntity<List<RescueRequestResponse>> getMyRequests(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(rescueService.getMyRequests(userId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get request detail")
    public ResponseEntity<RescueRequestResponse> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(rescueService.getRequestById(id));
    }

    @GetMapping
    @Operation(summary = "Admin/rescuer gets all requests with optional filters")
    public ResponseEntity<List<RescueRequestResponse>> getAllRequests(
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(required = false) PriorityLevel priorityLevel,
            @RequestParam(required = false) RequestType requestType) {
        return ResponseEntity.ok(rescueService.getAllRequests(status, priorityLevel, requestType));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get requests by specific status")
    public ResponseEntity<List<RescueRequestResponse>> getRequestsByStatus(@PathVariable RequestStatus status) {
        return ResponseEntity.ok(rescueService.getRequestsByStatus(status));
    }

    @PatchMapping("/{id}/assign")
    @Operation(summary = "Assign request to team/rescuer")
    public ResponseEntity<RescueRequestResponse> assignTeam(@PathVariable Long id, @Valid @RequestBody SupportRequestAssign request) {
        return ResponseEntity.ok(rescueService.assignTeam(id, request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update request status")
    public ResponseEntity<RescueRequestResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody SupportRequestStatusUpdate request) {
        return ResponseEntity.ok(rescueService.updateStatus(id, request));
    }
}
"""


for partial_path, content in files.items():
    full_path = os.path.join(base_dir, partial_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Support service generated successfully")
