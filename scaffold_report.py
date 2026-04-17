import os

base_dir = r"d:\Seminar_Nhom2\report-service"
src_main_java = os.path.join(base_dir, "src", "main", "java", "com", "stormshield", "reportservice")

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
    <artifactId>report-service</artifactId>
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

        <!-- Database (MySQL) -->
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
files[r"src\main\resources\application.properties"] = """server.port=8084
spring.application.name=report-service

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/stormshield_report?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
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
EXPOSE 8084
ENTRYPOINT ["java","-jar","/app/app.jar"]
"""

# 4. Main Class
files[r"src\main\java\com\stormshield\reportservice\ReportserviceApplication.java"] = """package com.stormshield.reportservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ReportserviceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ReportserviceApplication.class, args);
    }
}
"""

# 5. Enums
files[r"src\main\java\com\stormshield\reportservice\entity\ReportType.java"] = """package com.stormshield.reportservice.entity;

public enum ReportType {
    FLOOD, BLOCKED_ROAD, LANDSLIDE, EMERGENCY_NEED
}
"""

files[r"src\main\java\com\stormshield\reportservice\entity\DangerLevel.java"] = """package com.stormshield.reportservice.entity;

public enum DangerLevel {
    LOW, MEDIUM, HIGH, CRITICAL
}
"""

files[r"src\main\java\com\stormshield\reportservice\entity\VerificationStatus.java"] = """package com.stormshield.reportservice.entity;

public enum VerificationStatus {
    PENDING, APPROVED, REJECTED
}
"""

# 6. Entity
files[r"src\main\java\com\stormshield\reportservice\entity\HazardReport.java"] = """package com.stormshield.reportservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "hazard_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HazardReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportType reportType;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    private String imageUrl;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DangerLevel dangerLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus verificationStatus;

    private Long verifiedBy;
    private LocalDateTime verifiedAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
"""

# 7. Repository
files[r"src\main\java\com\stormshield\reportservice\repository\HazardReportRepository.java"] = """package com.stormshield.reportservice.repository;

import com.stormshield.reportservice.entity.HazardReport;
import com.stormshield.reportservice.entity.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HazardReportRepository extends JpaRepository<HazardReport, Long> {

    List<HazardReport> findByUserId(Long userId);
    
    List<HazardReport> findByVerificationStatus(VerificationStatus status);
}
"""

# 8. DTOs
files[r"src\main\java\com\stormshield\reportservice\dto\ReportRequest.java"] = """package com.stormshield.reportservice.dto;

import com.stormshield.reportservice.entity.DangerLevel;
import com.stormshield.reportservice.entity.ReportType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReportRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Report type is required")
    private ReportType reportType;

    @NotBlank(message = "Description is required")
    private String description;

    private String imageUrl;

    @NotNull(message = "Latitude is required")
    @Min(-90)
    @Max(90)
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @Min(-180)
    @Max(180)
    private Double longitude;

    @NotNull(message = "Danger level is required")
    private DangerLevel dangerLevel;
}
"""

files[r"src\main\java\com\stormshield\reportservice\dto\ReviewRequest.java"] = """package com.stormshield.reportservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewRequest {
    @NotNull(message = "Admin User ID is required to verify this report")
    private Long adminId;
}
"""

files[r"src\main\java\com\stormshield\reportservice\dto\ReportResponse.java"] = """package com.stormshield.reportservice.dto;

import com.stormshield.reportservice.entity.DangerLevel;
import com.stormshield.reportservice.entity.ReportType;
import com.stormshield.reportservice.entity.VerificationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReportResponse {
    private Long id;
    private Long userId;
    private ReportType reportType;
    private String description;
    private String imageUrl;
    private Double latitude;
    private Double longitude;
    private DangerLevel dangerLevel;
    private VerificationStatus verificationStatus;
    private Long verifiedBy;
    private LocalDateTime verifiedAt;
    private LocalDateTime createdAt;
}
"""

# 9. Service
files[r"src\main\java\com\stormshield\reportservice\service\ReportService.java"] = """package com.stormshield.reportservice.service;

import com.stormshield.reportservice.dto.ReportRequest;
import com.stormshield.reportservice.dto.ReportResponse;
import com.stormshield.reportservice.dto.ReviewRequest;
import com.stormshield.reportservice.entity.HazardReport;
import com.stormshield.reportservice.entity.VerificationStatus;
import com.stormshield.reportservice.repository.HazardReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final HazardReportRepository reportRepository;

    public ReportResponse submitReport(ReportRequest request) {
        HazardReport report = HazardReport.builder()
                .userId(request.getUserId())
                .reportType(request.getReportType())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .dangerLevel(request.getDangerLevel())
                .verificationStatus(VerificationStatus.PENDING)
                .build();

        return mapToResponse(reportRepository.save(report));
    }

    public List<ReportResponse> getReportsByUserId(Long userId) {
        return reportRepository.findByUserId(userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ReportResponse> getPendingReports() {
        return reportRepository.findByVerificationStatus(VerificationStatus.PENDING)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ReportResponse> getApprovedReports() {
        return reportRepository.findByVerificationStatus(VerificationStatus.APPROVED)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public ReportResponse getReportById(Long id) {
        HazardReport report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        return mapToResponse(report);
    }

    public ReportResponse approveReport(Long id, ReviewRequest request) {
        HazardReport report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setVerificationStatus(VerificationStatus.APPROVED);
        report.setVerifiedBy(request.getAdminId());
        report.setVerifiedAt(LocalDateTime.now());

        return mapToResponse(reportRepository.save(report));
    }

    public ReportResponse rejectReport(Long id, ReviewRequest request) {
        HazardReport report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setVerificationStatus(VerificationStatus.REJECTED);
        report.setVerifiedBy(request.getAdminId());
        report.setVerifiedAt(LocalDateTime.now());

        return mapToResponse(reportRepository.save(report));
    }

    private ReportResponse mapToResponse(HazardReport report) {
        return ReportResponse.builder()
                .id(report.getId())
                .userId(report.getUserId())
                .reportType(report.getReportType())
                .description(report.getDescription())
                .imageUrl(report.getImageUrl())
                .latitude(report.getLatitude())
                .longitude(report.getLongitude())
                .dangerLevel(report.getDangerLevel())
                .verificationStatus(report.getVerificationStatus())
                .verifiedBy(report.getVerifiedBy())
                .verifiedAt(report.getVerifiedAt())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
"""

# 10. Controller
files[r"src\main\java\com\stormshield\reportservice\controller\ReportController.java"] = """package com.stormshield.reportservice.controller;

import com.stormshield.reportservice.dto.ReportRequest;
import com.stormshield.reportservice.dto.ReportResponse;
import com.stormshield.reportservice.dto.ReviewRequest;
import com.stormshield.reportservice.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Community Hazard Reports", description = "Endpoints for managing citizen reports")
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    @Operation(summary = "Citizen submits a new hazard report")
    public ResponseEntity<ReportResponse> submitReport(@Valid @RequestBody ReportRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reportService.submitReport(request));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current user's reports. Extracts X-User-Id from headers if available.")
    public ResponseEntity<List<ReportResponse>> getMyReports(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(reportService.getReportsByUserId(userId));
    }

    @GetMapping("/pending")
    @Operation(summary = "Admin gets reports waiting for review")
    public ResponseEntity<List<ReportResponse>> getPendingReports() {
        return ResponseEntity.ok(reportService.getPendingReports());
    }

    @PatchMapping("/{id}/approve")
    @Operation(summary = "Admin approves a report")
    public ResponseEntity<ReportResponse> approveReport(@PathVariable Long id, @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reportService.approveReport(id, request));
    }

    @PatchMapping("/{id}/reject")
    @Operation(summary = "Admin rejects a report")
    public ResponseEntity<ReportResponse> rejectReport(@PathVariable Long id, @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reportService.rejectReport(id, request));
    }

    @GetMapping("/approved")
    @Operation(summary = "Get all approved reports for public map layer")
    public ResponseEntity<List<ReportResponse>> getApprovedReports() {
        return ResponseEntity.ok(reportService.getApprovedReports());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get report details by ID")
    public ResponseEntity<ReportResponse> getReportById(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getReportById(id));
    }
}
"""

# 11. Exception Handling
files[r"src\main\java\com\stormshield\reportservice\exception\GlobalExceptionHandler.java"] = """package com.stormshield.reportservice.exception;

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

print("Report service generated successfully")
