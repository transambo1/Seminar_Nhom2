package com.stormshield.alertservice.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AlertStatisticsResponse {
    private long totalAlerts;
    private long activeAlerts;
    private long expiredAlerts;
    private long cancelledAlerts;
    private long criticalAlerts;
    private long highAlerts;
    private long mediumAlerts;
    private long lowAlerts;
}
