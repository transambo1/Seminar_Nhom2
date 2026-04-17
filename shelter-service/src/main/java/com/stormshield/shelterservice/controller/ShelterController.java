package com.stormshield.shelterservice.controller;

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
