package com.stormshield.notificationservice.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NearbyAlertCheckResponse {
    private Long userId;
    private Double radiusKm;
    private Integer nearbyAlerts;
    private Integer notificationsCreated;
}
