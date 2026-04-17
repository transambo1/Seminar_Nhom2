import os

base_dir = r"d:\Seminar_Nhom2\shelter-service"
src_main_java = os.path.join(base_dir, "src", "main", "java", "com", "stormshield", "shelterservice")

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
    <artifactId>shelter-service</artifactId>
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
files[r"src\main\resources\application.properties"] = """server.port=8082
spring.application.name=shelter-service

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/stormshield_shelter?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
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
EXPOSE 8082
ENTRYPOINT ["java","-jar","/app/app.jar"]
"""

# 4. Main Class
files[r"src\main\java\com\stormshield\shelterservice\ShelterserviceApplication.java"] = """package com.stormshield.shelterservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ShelterserviceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShelterserviceApplication.class, args);
    }
}
"""

# 5. Enums
files[r"src\main\java\com\stormshield\shelterservice\entity\ShelterStatus.java"] = """package com.stormshield.shelterservice.entity;

public enum ShelterStatus {
    AVAILABLE, NEAR_FULL, FULL, CLOSED
}
"""

# 6. Entity
files[r"src\main\java\com\stormshield\shelterservice\entity\Shelter.java"] = """package com.stormshield.shelterservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "shelters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shelter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private Integer currentOccupancy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShelterStatus status;

    private String contactPhone;
    private String managedBy;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
"""

# 7. Repository
files[r"src\main\java\com\stormshield\shelterservice\repository\ShelterRepository.java"] = """package com.stormshield.shelterservice.repository;

import com.stormshield.shelterservice.entity.Shelter;
import com.stormshield.shelterservice.entity.ShelterStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShelterRepository extends JpaRepository<Shelter, Long> {

    List<Shelter> findByStatus(ShelterStatus status);

    // Haversine formula to find nearest shelters
    @Query(value = "SELECT * FROM shelters ORDER BY (6371 * acos(cos(radians(:latitude)) * cos(radians(latitude)) * cos(radians(longitude) - radians(:longitude)) + sin(radians(:latitude)) * sin(radians(latitude)))) ASC LIMIT :lim", nativeQuery = true)
    List<Shelter> findNearbyShelters(@Param("latitude") Double latitude, @Param("longitude") Double longitude, @Param("lim") int limit);
}
"""

# 8. DTOs
files[r"src\main\java\com\stormshield\shelterservice\dto\ShelterRequest.java"] = """package com.stormshield.shelterservice.dto;

import com.stormshield.shelterservice.entity.ShelterStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ShelterRequest {
    @NotBlank(message = "Shelter name is required")
    private String name;

    private String address;

    @NotNull(message = "Latitude is required")
    @Min(-90)
    @Max(90)
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @Min(-180)
    @Max(180)
    private Double longitude;

    @NotNull(message = "Capacity is required")
    @Min(0)
    private Integer capacity;

    private String contactPhone;
    private String managedBy;
    private ShelterStatus status;
}
"""

files[r"src\main\java\com\stormshield\shelterservice\dto\OccupancyRequest.java"] = """package com.stormshield.shelterservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OccupancyRequest {
    @NotNull(message = "Occupancy value is required")
    @Min(0)
    private Integer currentOccupancy;
}
"""

files[r"src\main\java\com\stormshield\shelterservice\dto\ShelterResponse.java"] = """package com.stormshield.shelterservice.dto;

import com.stormshield.shelterservice.entity.ShelterStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ShelterResponse {
    private Long id;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private Integer capacity;
    private Integer currentOccupancy;
    private ShelterStatus status;
    private String contactPhone;
    private String managedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
"""

# 9. Service
files[r"src\main\java\com\stormshield\shelterservice\service\ShelterService.java"] = """package com.stormshield.shelterservice.service;

import com.stormshield.shelterservice.dto.OccupancyRequest;
import com.stormshield.shelterservice.dto.ShelterRequest;
import com.stormshield.shelterservice.dto.ShelterResponse;
import com.stormshield.shelterservice.entity.Shelter;
import com.stormshield.shelterservice.entity.ShelterStatus;
import com.stormshield.shelterservice.repository.ShelterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShelterService {

    private final ShelterRepository shelterRepository;

    public ShelterResponse createShelter(ShelterRequest request) {
        Shelter shelter = Shelter.builder()
                .name(request.getName())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .capacity(request.getCapacity())
                .currentOccupancy(0)
                .status(request.getStatus() != null ? request.getStatus() : ShelterStatus.AVAILABLE)
                .contactPhone(request.getContactPhone())
                .managedBy(request.getManagedBy())
                .build();

        return mapToResponse(shelterRepository.save(shelter));
    }

    public ShelterResponse updateShelter(Long id, ShelterRequest request) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shelter not found"));

        shelter.setName(request.getName());
        shelter.setAddress(request.getAddress());
        shelter.setLatitude(request.getLatitude());
        shelter.setLongitude(request.getLongitude());
        shelter.setCapacity(request.getCapacity());
        shelter.setContactPhone(request.getContactPhone());
        shelter.setManagedBy(request.getManagedBy());
        if (request.getStatus() != null) {
            shelter.setStatus(request.getStatus());
        }

        updateStatusBasedOnOccupancy(shelter);
        return mapToResponse(shelterRepository.save(shelter));
    }

    public List<ShelterResponse> getAllShelters(ShelterStatus status) {
        List<Shelter> shelters = (status != null) 
            ? shelterRepository.findByStatus(status) 
            : shelterRepository.findAll();
            
        return shelters.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public ShelterResponse getShelterById(Long id) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shelter not found"));
        return mapToResponse(shelter);
    }

    public ShelterResponse updateOccupancy(Long id, OccupancyRequest request) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shelter not found"));

        shelter.setCurrentOccupancy(request.getCurrentOccupancy());
        updateStatusBasedOnOccupancy(shelter);

        return mapToResponse(shelterRepository.save(shelter));
    }

    public List<ShelterResponse> getNearbyShelters(Double latitude, Double longitude, int limit) {
        return shelterRepository.findNearbyShelters(latitude, longitude, limit)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private void updateStatusBasedOnOccupancy(Shelter shelter) {
        if (shelter.getStatus() == ShelterStatus.CLOSED) {
            return; // Don't auto-update if administratively closed
        }
        
        int capacity = shelter.getCapacity();
        int occupancy = shelter.getCurrentOccupancy();

        if (occupancy >= capacity) {
            shelter.setStatus(ShelterStatus.FULL);
        } else if (occupancy >= capacity * 0.9) {
            shelter.setStatus(ShelterStatus.NEAR_FULL);
        } else {
            shelter.setStatus(ShelterStatus.AVAILABLE);
        }
    }

    private ShelterResponse mapToResponse(Shelter shelter) {
        return ShelterResponse.builder()
                .id(shelter.getId())
                .name(shelter.getName())
                .address(shelter.getAddress())
                .latitude(shelter.getLatitude())
                .longitude(shelter.getLongitude())
                .capacity(shelter.getCapacity())
                .currentOccupancy(shelter.getCurrentOccupancy())
                .status(shelter.getStatus())
                .contactPhone(shelter.getContactPhone())
                .managedBy(shelter.getManagedBy())
                .createdAt(shelter.getCreatedAt())
                .updatedAt(shelter.getUpdatedAt())
                .build();
    }
}
"""

# 10. Controller
files[r"src\main\java\com\stormshield\shelterservice\controller\ShelterController.java"] = """package com.stormshield.shelterservice.controller;

import com.stormshield.shelterservice.dto.OccupancyRequest;
import com.stormshield.shelterservice.dto.ShelterRequest;
import com.stormshield.shelterservice.dto.ShelterResponse;
import com.stormshield.shelterservice.entity.ShelterStatus;
import com.stormshield.shelterservice.service.ShelterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/shelters")
@RequiredArgsConstructor
@Tag(name = "Shelter Management", description = "Endpoints for managing emergency shelters")
public class ShelterController {

    private final ShelterService shelterService;

    @PostMapping
    @Operation(summary = "Create a new shelter")
    public ResponseEntity<ShelterResponse> createShelter(@Valid @RequestBody ShelterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(shelterService.createShelter(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update shelter information")
    public ResponseEntity<ShelterResponse> updateShelter(@PathVariable Long id, @Valid @RequestBody ShelterRequest request) {
        return ResponseEntity.ok(shelterService.updateShelter(id, request));
    }

    @GetMapping
    @Operation(summary = "Get all shelters, option to filter by status")
    public ResponseEntity<List<ShelterResponse>> getAllShelters(@RequestParam(required = false) ShelterStatus status) {
        return ResponseEntity.ok(shelterService.getAllShelters(status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get shelter details by ID")
    public ResponseEntity<ShelterResponse> getShelterById(@PathVariable Long id) {
        return ResponseEntity.ok(shelterService.getShelterById(id));
    }

    @PatchMapping("/{id}/occupancy")
    @Operation(summary = "Update occupancy for a shelter")
    public ResponseEntity<ShelterResponse> updateOccupancy(@PathVariable Long id, @Valid @RequestBody OccupancyRequest request) {
        return ResponseEntity.ok(shelterService.updateOccupancy(id, request));
    }

    @GetMapping("/nearby")
    @Operation(summary = "Find nearby shelters using coordinates")
    public ResponseEntity<List<ShelterResponse>> getNearbyShelters(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(shelterService.getNearbyShelters(latitude, longitude, limit));
    }
}
"""

# 11. Exception Handling
files[r"src\main\java\com\stormshield\shelterservice\exception\GlobalExceptionHandler.java"] = """package com.stormshield.shelterservice.exception;

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

print("Shelter service generated successfully")
