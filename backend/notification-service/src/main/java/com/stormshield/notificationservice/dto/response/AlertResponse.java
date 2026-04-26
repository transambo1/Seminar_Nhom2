package com.stormshield.notificationservice.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertResponse {
    private Long id;
    private String title;
    private String type;
    private String affectedArea;
    private Double latitude;
    private Double longitude;
    private String status;
}
