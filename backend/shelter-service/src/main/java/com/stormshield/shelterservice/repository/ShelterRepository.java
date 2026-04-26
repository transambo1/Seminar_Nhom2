package com.stormshield.shelterservice.repository;

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
