package com.stormshield.alertservice.dto.request;

import com.stormshield.alertservice.entity.AlertStatus;
import com.stormshield.alertservice.entity.AlertType;
import com.stormshield.alertservice.entity.SeverityLevel;
import com.stormshield.alertservice.specification.AlertSpecification;
import com.stormshield.alertservice.entity.Alert;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.jpa.domain.Specification;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class AlertFilterRequest {
    private AlertStatus status;
    private AlertType alertType;
    private SeverityLevel severityLevel;
    private Double userLat;
    private Double userLng;
    private Double radiusInMeters;
    private String sortBy;
    private String direction;

    public Specification<Alert> specification() {
        return new AlertSpecification()
                .withStatus(status)
                .withAlertType(alertType)
                .withSeverityLevel(severityLevel)
                .build();
    }
}
