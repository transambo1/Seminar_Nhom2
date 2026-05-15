package com.stormshield.alertservice.service.impl;

import com.stormshield.alertservice.dto.weather.WeatherSnapshotDto;
import com.stormshield.alertservice.service.WeatherClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenWeatherClient implements WeatherClient {

    private final RestTemplate restTemplate;

    @Value("${external.weather.api.base-url}")
    private String baseUrl;

    @Value("${external.weather.api.key}")
    private String apiKey;

    @Value("${external.weather.api.units}")
    private String units;

    @Override
    @SuppressWarnings("unchecked")
    public WeatherSnapshotDto fetchWeather(double latitude, double longitude) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
                    .queryParam("lat", latitude)
                    .queryParam("lon", longitude)
                    .queryParam("appid", apiKey)
                    .queryParam("units", units)
                    .toUriString();

            log.info("Fetching weather from: {}", url.replaceAll("appid=[^&]*", "appid=****"));

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null) {
                throw new RuntimeException("Empty response from Weather API");
            }

            Map<String, Object> main = (Map<String, Object>) response.get("main");
            Map<String, Object> wind = (Map<String, Object>) response.get("wind");
            List<Map<String, Object>> weatherList = (List<Map<String, Object>>) response.get("weather");
            Map<String, Object> rain = (Map<String, Object>) response.get("rain");

            Double rain1h = null;
            if (rain != null && rain.containsKey("1h")) {
                rain1h = Double.valueOf(rain.get("1h").toString());
            }

            String weatherMain = "";
            String weatherDesc = "";
            if (weatherList != null && !weatherList.isEmpty()) {
                weatherMain = weatherList.get(0).get("main").toString();
                weatherDesc = weatherList.get(0).get("description").toString();
            }

            return WeatherSnapshotDto.builder()
                    .latitude(latitude)
                    .longitude(longitude)
                    .temperature(Double.parseDouble(main.get("temp").toString()))
                    .humidity(Integer.parseInt(main.get("humidity").toString()))
                    .windSpeed(Double.parseDouble(wind.get("speed").toString()))
                    .rainVolume1h(rain1h)
                    .weatherMain(weatherMain)
                    .weatherDescription(weatherDesc)
                    .timestamp(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            log.error("Error fetching weather data: {}", e.getMessage());
            // In a seminar prototype, we return a fallback or throw. 
            // Here we throw to let the controller handle it for the test endpoint.
            throw new RuntimeException("Failed to fetch weather: " + e.getMessage());
        }
    }
}
