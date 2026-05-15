package com.stormshield.alertservice.dto.weather;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class WeatherTestResponse {
    private WeatherSnapshotDto snapshot;
    private List<WeatherRiskResult> risks;
}
