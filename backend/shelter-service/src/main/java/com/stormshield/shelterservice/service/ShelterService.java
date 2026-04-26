package com.stormshield.shelterservice.service;

import com.stormshield.shelterservice.dto.request.OccupancyUpdateRequest;
import com.stormshield.shelterservice.dto.request.ShelterCreateRequest;
import com.stormshield.shelterservice.dto.response.ShelterResponse;
import com.stormshield.shelterservice.entity.Shelter;
import com.stormshield.shelterservice.entity.ShelterStatus;
import com.stormshield.shelterservice.repository.ShelterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ShelterService {

    private final ShelterRepository shelterRepository;

    public ShelterResponse createShelter(ShelterCreateRequest request) {
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

    public ShelterResponse updateShelter(Long id, ShelterCreateRequest request) {
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

    public ShelterResponse updateOccupancy(Long id, OccupancyUpdateRequest request) {
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
