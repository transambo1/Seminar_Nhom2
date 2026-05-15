package com.stormshield.alertservice.service;

import com.stormshield.alertservice.entity.WeatherLocation;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WeatherLocationService {

    private static final List<WeatherLocation> LOCATIONS = Arrays.asList(
        new WeatherLocation("AG", "An Giang", 10.385, 105.426, "SOUTH"),
        new WeatherLocation("BV", "Bà Rịa – Vũng Tàu", 10.490, 107.160, "SOUTH"),
        new WeatherLocation("BG", "Bắc Giang", 21.273, 106.195, "NORTH"),
        new WeatherLocation("BK", "Bắc Kạn", 22.146, 105.833, "NORTH"),
        new WeatherLocation("BL", "Bạc Liêu", 9.290, 105.727, "SOUTH"),
        new WeatherLocation("BN", "Bắc Ninh", 21.185, 106.075, "NORTH"),
        new WeatherLocation("BT", "Bến Tre", 10.242, 106.375, "SOUTH"),
        new WeatherLocation("BD", "Bình Dương", 10.978, 106.666, "SOUTH"),
        new WeatherLocation("BP", "Bình Phước", 11.537, 106.883, "SOUTH"),
        new WeatherLocation("BH", "Bình Thuận", 10.932, 108.097, "CENTRAL"),
        new WeatherLocation("BI", "Bình Định", 13.774, 109.215, "CENTRAL"),
        new WeatherLocation("CM", "Cà Mau", 9.176, 105.152, "SOUTH"),
        new WeatherLocation("CT", "Cần Thơ", 10.045, 105.747, "SOUTH"),
        new WeatherLocation("CB", "Cao Bằng", 22.663, 106.257, "NORTH"),
        new WeatherLocation("DN", "Đà Nẵng", 16.047, 108.206, "CENTRAL"),
        new WeatherLocation("DL", "Đắk Lắk", 12.671, 108.035, "CENTRAL"),
        new WeatherLocation("DK", "Đắk Nông", 11.988, 107.728, "CENTRAL"),
        new WeatherLocation("DB", "Điện Biên", 21.385, 103.017, "NORTH"),
        new WeatherLocation("DI", "Đồng Nai", 10.947, 106.840, "SOUTH"),
        new WeatherLocation("DT", "Đồng Tháp", 10.461, 105.626, "SOUTH"),
        new WeatherLocation("GL", "Gia Lai", 13.982, 108.001, "CENTRAL"),
        new WeatherLocation("HG", "Hà Giang", 22.825, 104.982, "NORTH"),
        new WeatherLocation("HN", "Hà Nam", 20.544, 105.908, "NORTH"),
        new WeatherLocation("HA", "Hà Nội", 21.028, 105.854, "NORTH"),
        new WeatherLocation("HT", "Hà Tĩnh", 18.337, 105.904, "CENTRAL"),
        new WeatherLocation("HD", "Hải Dương", 20.939, 106.331, "NORTH"),
        new WeatherLocation("HP", "Hải Phòng", 20.845, 106.688, "NORTH"),
        new WeatherLocation("HU", "Hậu Giang", 9.782, 105.733, "SOUTH"),
        new WeatherLocation("HB", "Hòa Bình", 20.810, 105.340, "NORTH"),
        new WeatherLocation("HY", "Hưng Yên", 20.651, 106.052, "NORTH"),
        new WeatherLocation("KH", "Khánh Hòa", 12.245, 109.195, "CENTRAL"),
        new WeatherLocation("KG", "Kiên Giang", 10.012, 105.074, "SOUTH"),
        new WeatherLocation("KT", "Kon Tum", 14.348, 108.003, "CENTRAL"),
        new WeatherLocation("LC", "Lai Châu", 22.392, 103.468, "NORTH"),
        new WeatherLocation("LD", "Lâm Đồng", 11.940, 108.435, "CENTRAL"),
        new WeatherLocation("LS", "Lạng Sơn", 21.848, 106.762, "NORTH"),
        new WeatherLocation("LO", "Lào Cai", 22.483, 103.973, "NORTH"),
        new WeatherLocation("LA", "Long An", 10.540, 106.402, "SOUTH"),
        new WeatherLocation("ND", "Nam Định", 20.421, 106.170, "NORTH"),
        new WeatherLocation("NA", "Nghệ An", 18.665, 105.672, "CENTRAL"),
        new WeatherLocation("NB", "Ninh Bình", 20.252, 105.975, "NORTH"),
        new WeatherLocation("NT", "Ninh Thuận", 11.564, 108.989, "CENTRAL"),
        new WeatherLocation("PT", "Phú Thọ", 21.306, 105.405, "NORTH"),
        new WeatherLocation("PY", "Phú Yên", 13.088, 109.297, "CENTRAL"),
        new WeatherLocation("QB", "Quảng Bình", 17.482, 106.602, "CENTRAL"),
        new WeatherLocation("QN", "Quảng Nam", 15.567, 108.283, "CENTRAL"),
        new WeatherLocation("QG", "Quảng Ngãi", 15.120, 108.794, "CENTRAL"),
        new WeatherLocation("QI", "Quảng Ninh", 20.957, 107.075, "NORTH"),
        new WeatherLocation("QT", "Quảng Trị", 16.745, 107.186, "CENTRAL"),
        new WeatherLocation("ST", "Sóc Trăng", 9.605, 105.971, "SOUTH"),
        new WeatherLocation("SL", "Sơn La", 21.327, 103.921, "NORTH"),
        new WeatherLocation("TN", "Tây Ninh", 11.300, 106.100, "SOUTH"),
        new WeatherLocation("TB", "Thái Bình", 20.447, 106.337, "NORTH"),
        new WeatherLocation("TY", "Thái Nguyên", 21.583, 105.850, "NORTH"),
        new WeatherLocation("TH", "Thanh Hóa", 19.807, 105.773, "CENTRAL"),
        new WeatherLocation("TTH", "Thừa Thiên Huế", 16.467, 107.591, "CENTRAL"),
        new WeatherLocation("TG", "Tiền Giang", 10.354, 106.366, "SOUTH"),
        new WeatherLocation("HCM", "TP. Hồ Chí Minh", 10.776, 106.701, "SOUTH"),
        new WeatherLocation("TV", "Trà Vinh", 9.931, 106.345, "SOUTH"),
        new WeatherLocation("TQ", "Tuyên Quang", 21.815, 105.258, "NORTH"),
        new WeatherLocation("VL", "Vĩnh Long", 10.250, 105.967, "SOUTH"),
        new WeatherLocation("VP", "Vĩnh Phúc", 21.312, 105.603, "NORTH"),
        new WeatherLocation("YB", "Yên Bái", 21.716, 104.872, "NORTH")
    );

    public List<WeatherLocation> getAllVietnamWeatherLocations() {
        return LOCATIONS;
    }

    public List<WeatherLocation> getLocationsByRegion(String region) {
        return LOCATIONS.stream()
                .filter(loc -> loc.getRegion().equalsIgnoreCase(region))
                .collect(Collectors.toList());
    }
}
