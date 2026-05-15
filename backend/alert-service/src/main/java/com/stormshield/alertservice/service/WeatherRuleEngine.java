package com.stormshield.alertservice.service;

import com.stormshield.alertservice.dto.weather.WeatherRiskResult;
import com.stormshield.alertservice.dto.weather.WeatherSnapshotDto;
import com.stormshield.alertservice.entity.AlertType;
import com.stormshield.alertservice.entity.SeverityLevel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class WeatherRuleEngine {

    @Value("${weather.rules.rain.high-mm:30.0}")
    private double rainHighThreshold;

    @Value("${weather.rules.rain.critical-mm:100.0}")
    private double rainCriticalThreshold;

    @Value("${weather.rules.wind.medium-kmh:40.0}")
    private double windMediumThreshold;

    @Value("${weather.rules.wind.critical-kmh:80.0}")
    private double windCriticalThreshold;

    public List<WeatherRiskResult> evaluateRisk(WeatherSnapshotDto snapshot) {
        List<WeatherRiskResult> results = new ArrayList<>();
        
        String locationName = snapshot.getProvinceName() != null ? snapshot.getProvinceName() : "khu vực";

        // Rule 1: Rain Evaluation
        evaluateRainRule(snapshot, locationName, results);

        // Rule 2: Wind Evaluation
        evaluateWindRule(snapshot, locationName, results);

        return results;
    }

    private void evaluateRainRule(WeatherSnapshotDto snapshot, String locationName, List<WeatherRiskResult> results) {
        Double rain = snapshot.getRainVolume1h();
        if (rain == null) return;

        if (rain >= rainCriticalThreshold) {
            results.add(WeatherRiskResult.builder()
                    .triggered(true)
                    .alertType(AlertType.FLOOD)
                    .severity(SeverityLevel.CRITICAL)
                    .title("Cảnh báo mưa cực lớn - Nguy cơ lũ lụt tại " + locationName)
                    .description(String.format("Hệ thống phát hiện lượng mưa đo được %.1fmm. Nguy cơ ngập lụt diện rộng.", rain))
                    .recommendation("Cần sơ tán khỏi vùng thấp trũng ngay lập tức.")
                    .build());
        } else if (rain >= rainHighThreshold) {
            results.add(WeatherRiskResult.builder()
                    .triggered(true)
                    .alertType(AlertType.STORM)
                    .severity(SeverityLevel.HIGH)
                    .title("Cảnh báo mưa lớn tại " + locationName)
                    .description(String.format("Lượng mưa đo được %.1fmm. Đề phòng ngập úng cục bộ.", rain))
                    .recommendation("Hạn chế ra đường nếu không cần thiết.")
                    .build());
        }
    }

    private void evaluateWindRule(WeatherSnapshotDto snapshot, String locationName, List<WeatherRiskResult> results) {
        // Wind speed from API is usually in m/s if units=metric, converting to km/h for rules
        double windKmh = snapshot.getWindSpeed() * 3.6;

        if (windKmh >= windCriticalThreshold) {
            results.add(WeatherRiskResult.builder()
                    .triggered(true)
                    .alertType(AlertType.STORM)
                    .severity(SeverityLevel.CRITICAL)
                    .title("Cảnh báo gió bão mạnh tại " + locationName)
                    .description(String.format("Tốc độ gió đo được %.1fkm/h. Cảnh báo nguy hiểm đến tính mạng.", windKmh))
                    .recommendation("Tuyệt đối không ra khỏi nhà, gia cố cửa sổ ngay lập tức.")
                    .build());
        } else if (windKmh >= windMediumThreshold) {
            results.add(WeatherRiskResult.builder()
                    .triggered(true)
                    .alertType(AlertType.STORM)
                    .severity(SeverityLevel.MEDIUM)
                    .title("Cảnh báo gió giật mạnh tại " + locationName)
                    .description(String.format("Tốc độ gió %.1fkm/h. Cảnh báo cây cối gãy đổ.", windKmh))
                    .recommendation("Chú ý khi di chuyển ngoài trời, tránh xa các biển hiệu quảng cáo.")
                    .build());
        }
    }
}
