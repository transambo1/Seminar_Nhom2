package com.stormshield.alertservice.service;

import com.stormshield.alertservice.dto.weather.WeatherSnapshotDto;

public interface WeatherClient {
    WeatherSnapshotDto fetchWeather(double latitude, double longitude);
}
