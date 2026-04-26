package com.stormshield.alertservice.external;

import com.stormshield.alertservice.entity.Alert;
import com.stormshield.alertservice.entity.AlertStatus;
import com.stormshield.alertservice.entity.AlertType;
import com.stormshield.alertservice.entity.SeverityLevel;
import com.stormshield.alertservice.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExternalAlertSyncService {

    private final NasaEonetClient nasaEonetClient;
    private final AlertRepository alertRepository;

    @Transactional
    @SuppressWarnings({ "unchecked", "null" })
    public ExternalAlertSyncResult syncNasaEvents() {
        Map<String, Object> response = nasaEonetClient.fetchOpenEvents();
        
        if (response == null || !response.containsKey("events")) {
            return ExternalAlertSyncResult.builder()
                    .source("NASA_EONET")
                    .imported(0).skipped(0).totalReceived(0)
                    .build();
        }

        List<Map<String, Object>> events = (List<Map<String, Object>>) response.get("events");
        int imported = 0;
        int skipped = 0;

        for (Map<String, Object> event : events) {
            String id = (String) event.get("id");
            if (id == null) {
                skipped++;
                continue;
            }

            if (alertRepository.existsBySourceAndExternalEventId("NASA_EONET", id)) {
                skipped++;
                continue;
            }

            List<Map<String, Object>> geometries = (List<Map<String, Object>>) event.get("geometry");
            if (geometries == null || geometries.isEmpty()) {
                skipped++;
                continue;
            }

            Map<String, Object> geometry = geometries.get(0);
            List<Double> coordinates = (List<Double>) geometry.get("coordinates");
            if (coordinates == null || coordinates.size() < 2) {
                skipped++;
                continue;
            }
            
            Double longitude = null;
            Double latitude = null;
            try {
                longitude = ((Number) coordinates.get(0)).doubleValue();
                latitude = ((Number) coordinates.get(1)).doubleValue();
            } catch (Exception e) {
                skipped++;
                continue;
            }

            String title = (String) event.get("title");
            String description = (String) event.get("description");
            if (description == null || description.trim().isEmpty()) {
                description = title;
            }

            AlertType alertType = AlertType.OTHER; 
            
            List<Map<String, Object>> categories = (List<Map<String, Object>>) event.get("categories");
            if (categories != null && !categories.isEmpty()) {
                String catId = (String) categories.get(0).get("id");
                if ("floods".equals(catId)) alertType = AlertType.FLOOD;
                else if ("severeStorms".equals(catId)) alertType = AlertType.STORM;
                else if ("wildfires".equals(catId)) alertType = AlertType.FIRE;
                else if ("volcanoes".equals(catId)) alertType = AlertType.VOLCANO;
                else if ("drought".equals(catId)) alertType = AlertType.DROUGHT;
            }

            String dateStr = (String) geometry.get("date");
            LocalDateTime startTime = LocalDateTime.now();
            if (dateStr != null) {
                try {
                    startTime = LocalDateTime.parse(dateStr, DateTimeFormatter.ISO_DATE_TIME);
                } catch (Exception e) {
                    log.warn("Could not parse date for event {}", id);
                }
            }

            Alert alert = Alert.builder()
                    .title(title != null ? title : "Unknown Event")
                    .description(description)
                    .alertType(alertType)
                    .severityLevel(SeverityLevel.MEDIUM)
                    .affectedArea(title != null ? title : "Global")
                    .latitude(latitude)
                    .longitude(longitude)
                    .startTime(startTime)
                    .endTime(startTime.plusDays(3))
                    .status(AlertStatus.ACTIVE)
                    .issuedBy("NASA_EONET")
                    .source("NASA_EONET")
                    .externalEventId(id)
                    .lastSyncedAt(LocalDateTime.now())
                    .createdFromReportId(null)
                    .build();

            alertRepository.save(alert);
            imported++;
        }

        return ExternalAlertSyncResult.builder()
                .source("NASA_EONET")
                .imported(imported)
                .skipped(skipped)
                .totalReceived(events.size())
                .build();
    }
}
