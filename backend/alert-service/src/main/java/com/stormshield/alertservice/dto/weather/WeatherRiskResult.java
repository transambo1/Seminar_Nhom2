package com.stormshield.alertservice.dto.weather;

import com.stormshield.alertservice.entity.AlertType;
import com.stormshield.alertservice.entity.SeverityLevel;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WeatherRiskResult {
    private boolean triggered;
    private AlertType alertType;
    private SeverityLevel severity;
    private String title;
    private String description;
    private String recommendation;
}
