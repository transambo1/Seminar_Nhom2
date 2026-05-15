package com.stormshield.alertservice.dto.weather;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class WeatherSnapshotDto {
    private String provinceCode;
    private String provinceName;
    private double latitude;
    private double longitude;
    
    private double temperature;
    private int humidity;
    private double windSpeed;
    private Double rainVolume1h; // Can be null
    
    private String weatherMain;
    private String weatherDescription;
    private LocalDateTime timestamp;
}
