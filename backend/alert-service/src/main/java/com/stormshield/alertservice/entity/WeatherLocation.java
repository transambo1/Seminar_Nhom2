package com.stormshield.alertservice.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherLocation {
    private String provinceCode;
    private String provinceName;
    private double latitude;
    private double longitude;
    private String region;
}
