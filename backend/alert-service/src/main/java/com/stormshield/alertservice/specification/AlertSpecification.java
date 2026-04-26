package com.stormshield.alertservice.specification;

import com.stormshield.alertservice.entity.Alert;
import com.stormshield.alertservice.entity.AlertStatus;
import com.stormshield.alertservice.entity.AlertType;
import com.stormshield.alertservice.entity.SeverityLevel;
import org.springframework.data.jpa.domain.Specification;

public class AlertSpecification {

    private Specification<Alert> spec = Specification.where(null);

    public AlertSpecification withStatus(AlertStatus status) {
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        return this;
    }

    public AlertSpecification withAlertType(AlertType alertType) {
        if (alertType != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("alertType"), alertType));
        }
        return this;
    }

    public AlertSpecification withSeverityLevel(SeverityLevel severityLevel) {
        if (severityLevel != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("severityLevel"), severityLevel));
        }
        return this;
    }

    public Specification<Alert> build() {
        return spec;
    }
}
