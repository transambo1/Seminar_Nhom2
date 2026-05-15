package com.stormshield.alertservice.service;

import com.stormshield.alertservice.dto.weather.WeatherSnapshotDto;
import com.stormshield.alertservice.entity.WeatherLocation;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class DemoWeatherProvider {

    public Optional<WeatherSnapshotDto> getDemoWeather(WeatherLocation location, String scenario) {
        if ("CENTRAL_STORM".equalsIgnoreCase(scenario)) {
            return getCentralStormScenario(location);
        } else if ("NORTHERN_HEAVY_RAIN".equalsIgnoreCase(scenario)) {
            return getNorthernRainScenario(location);
        }
        return Optional.empty();
    }

    private Optional<WeatherSnapshotDto> getCentralStormScenario(WeatherLocation location) {
        // High risk for Central Vietnam provinces
        if ("CENTRAL".equalsIgnoreCase(location.getRegion())) {
            return Optional.of(WeatherSnapshotDto.builder()
                    .provinceCode(location.getProvinceCode())
                    .provinceName(location.getProvinceName())
                    .latitude(location.getLatitude())
                    .longitude(location.getLongitude())
                    .temperature(24.5)
                    .humidity(95)
                    .windSpeed(25.0) // 25m/s * 3.6 = 90km/h (CRITICAL)
                    .rainVolume1h(120.0) // 120mm (CRITICAL)
                    .weatherMain("Storm")
                    .weatherDescription("Bão mạnh kèm mưa cực lớn")
                    .timestamp(LocalDateTime.now())
                    .build());
        }
        
        // Normal weather for other regions in this scenario
        return Optional.of(createNormalWeather(location));
    }

    private Optional<WeatherSnapshotDto> getNorthernRainScenario(WeatherLocation location) {
        if ("NORTH".equalsIgnoreCase(location.getRegion())) {
            return Optional.of(WeatherSnapshotDto.builder()
                    .provinceCode(location.getProvinceCode())
                    .provinceName(location.getProvinceName())
                    .latitude(location.getLatitude())
                    .longitude(location.getLongitude())
                    .temperature(21.0)
                    .humidity(90)
                    .windSpeed(8.0) // 28.8 km/h (Normal)
                    .rainVolume1h(50.0) // 50mm (HIGH)
                    .weatherMain("Rain")
                    .weatherDescription("Mưa lớn kéo dài")
                    .timestamp(LocalDateTime.now())
                    .build());
        }
        return Optional.of(createNormalWeather(location));
    }

    private WeatherSnapshotDto createNormalWeather(WeatherLocation location) {
        return WeatherSnapshotDto.builder()
                .provinceCode(location.getProvinceCode())
                .provinceName(location.getProvinceName())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .temperature(30.0)
                .humidity(60)
                .windSpeed(3.0)
                .rainVolume1h(0.0)
                .weatherMain("Clear")
                .weatherDescription("Trời quang đãng")
                .timestamp(LocalDateTime.now())
                .build();
    }
}
