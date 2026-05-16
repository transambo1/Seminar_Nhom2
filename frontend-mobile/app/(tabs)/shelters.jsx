import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Platform, ActivityIndicator, Animated,
  SafeAreaView, Dimensions, Linking, Alert
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { C } from '../../src/constants/colors';
import { fetchAllDisasterData } from '../../src/api/disasterApiService';
import { MARKER_CONFIG, SEVERITY_CONFIG } from '../../src/constants/markerConfig';

const { height: SH } = Dimensions.get('window');

// Dữ liệu Shelter giữ nguyên
const SHELTERS = [
  {
    id: 's1', name: 'Central Community Center', address: '450 Civic Center Dr',
    distance: '1.2 mi', capacity: 320, maxCapacity: 500, petFriendly: true,
    status: 'Accepting Evacuees', coordinate: { latitude: 10.7756, longitude: 106.668 },
  },
  {
    id: 's2', name: 'Northside Community Center', address: '1200 NW 15th St',
    distance: '3.4 mi', capacity: 450, maxCapacity: 500, petFriendly: true,
    status: 'Open', coordinate: { latitude: 10.795, longitude: 106.652 },
  },
];

function timeAgo(iso) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export default function ShelterMapScreen() {
  const mapRef = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); 
  const [selectedType, setSelectedType] = useState(null); 
  const slideAnim = useRef(new Animated.Value(400)).current;

  // State cho thanh Search, GPS hiện tại và Marker Search
  const [searchQuery, setSearchQuery] = useState('');
  const [userLoc, setUserLoc] = useState(null);
  const [searchedLoc, setSearchedLoc] = useState(null); // 🟢 Lưu tọa độ vừa search để cắm ghim

  useEffect(() => {
    (async () => {
      let loc = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setUserLoc(loc);
          
          mapRef.current?.animateToRegion({ ...loc, latitudeDelta: 0.1, longitudeDelta: 0.1 }, 1000);
        }
      } catch (_) {}
      try {
        const data = await fetchAllDisasterData(loc);
        setMarkers(data.slice(0, 300)); // 🟢 Tăng lên 300 để hiện đa dạng loại thiên tai (cháy rừng, hạn hán...)
      } catch (e) { console.warn(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = filter === 'all' ? markers : markers.filter(m => m.type === filter);

  // ─── HÀM XỬ LÝ ─────────────────────────────────────────────────────────────
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const results = await Location.geocodeAsync(searchQuery);
      if (results.length > 0) {
        const loc = results[0];
        setSearchedLoc({ latitude: loc.latitude, longitude: loc.longitude }); // 🟢 Lưu lại để vẽ ghim 🎯
        mapRef.current?.animateToRegion({ latitude: loc.latitude, longitude: loc.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }, 1000);
      } else {
        Alert.alert("Không tìm thấy", "Hãy thử nhập địa chỉ chi tiết hơn.");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tìm kiếm địa chỉ lúc này.");
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchedLoc(null); // 🟢 Xóa luôn ghim bia ngắm trên bản đồ
  };

  const goToMyLocation = () => {
    if (userLoc) {
      mapRef.current?.animateToRegion({ ...userLoc, latitudeDelta: 0.05, longitudeDelta: 0.05 }, 500);
    } else {
      Alert.alert("Lỗi", "Chưa lấy được vị trí GPS của bạn.");
    }
  };

  const selectItem = (item, type) => {
    setSelected(item);
    setSelectedType(type);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
    mapRef.current?.animateToRegion({ ...item.coordinate, latitudeDelta: 0.05, longitudeDelta: 0.05 }, 500);
  };

  const dismissCard = () => {
    Animated.timing(slideAnim, { toValue: 400, duration: 200, useNativeDriver: true }).start(() => {
      setSelected(null);
    });
  };

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      {/* MAP */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_DEFAULT}
        initialRegion={{ latitude: 10.762622, longitude: 106.660172, latitudeDelta: 0.3, longitudeDelta: 0.3 }}
        showsUserLocation
      >
        {/* 🟢 VẼ SHELTER TRƯỚC: Khắc phục triệt để lỗi mất tích khi react-native-maps re-render */}
        {SHELTERS.map(sh => (
          <Marker key={`shelter-${sh.id}`} coordinate={sh.coordinate} onPress={() => selectItem(sh, 'shelter')} zIndex={100}>
            <View style={[ms.pin, { backgroundColor: '#e3f2fd', borderColor: C.primary, borderWidth: 3 }]}>
              <Text style={{fontSize: 18}}>🏠</Text>
            </View>
          </Marker>
        ))}

        {/* 🟢 VẼ KẾT QUẢ TÌM KIẾM (Nếu có) */}
        {searchedLoc && (
          <Marker coordinate={searchedLoc} zIndex={150}>
            <View style={[ms.pin, { backgroundColor: '#111827', borderColor: '#ffffff', borderWidth: 2 }]}>
              <Text style={{fontSize: 18}}>🎯</Text>
            </View>
          </Marker>
        )}

        {/* 🟢 VẼ THẢM HỌA SAU CÙNG */}
        {filtered.map(m => {
          const cfg = MARKER_CONFIG[m.type] || MARKER_CONFIG.other;
          return (
            <Marker key={`disaster-${m.id}`} coordinate={m.coordinate} onPress={() => selectItem(m, 'disaster')} zIndex={10}>
              <View style={[ms.pin, { backgroundColor: cfg.bgColor, borderColor: cfg.color }]}>
                <Text style={{fontSize: 16}}>{cfg.emoji}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* HEADER */}
      <SafeAreaView style={s.headerSafe}>
        {/* Search Input thật */}
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput 
            style={s.searchInput} 
            placeholder="Search address or area..." 
            placeholderTextColor={C.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Text style={s.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Dynamic Filter Pills - Nhớ vuốt ngang nhé */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
          <TouchableOpacity style={[s.pill, filter === 'all' && s.pillActive]} onPress={() => setFilter('all')}>
            <Text style={s.pillEmoji}>🌐</Text>
            <Text style={[s.pillLabel, filter === 'all' && s.pillLabelActive]}>All Alerts</Text>
          </TouchableOpacity>

          {Object.keys(MARKER_CONFIG).filter(k => k !== 'other').map(key => {
            const cfg = MARKER_CONFIG[key];
            return (
              <TouchableOpacity key={key} style={[s.pill, filter === key && s.pillActive]} onPress={() => setFilter(key)}>
                <Text style={s.pillEmoji}>{cfg.emoji}</Text>
                <Text style={[s.pillLabel, filter === key && s.pillLabelActive]}>{cfg.label}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </SafeAreaView>

      {/* MAP CONTROLS */}
      <View style={s.controls}>
        <TouchableOpacity style={s.ctrlBtn} onPress={goToMyLocation}>
          <Text style={s.ctrlIcon}>📍</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.ctrlBtn} onPress={() => router.push('/disaster-map')}>
          <Text style={s.ctrlIcon}>🗺️</Text>
        </TouchableOpacity>
      </View>

      {/* LOADING */}
      {loading && (
        <View style={s.loadingBox}>
          <ActivityIndicator color={C.error} />
          <Text style={s.loadingText}>Loading live data…</Text>
        </View>
      )}

      {/* DETAIL CARD */}
      {selected && (
        <Animated.View style={[s.detailCard, { transform: [{ translateY: slideAnim }] }]}>
          <View style={s.cardHandle} />
          {selectedType === 'shelter' ? (
            <ShelterCard shelter={selected} onClose={dismissCard} />
          ) : (
            <DisasterCard marker={selected} onClose={dismissCard} />
          )}
        </Animated.View>
      )}
    </View>
  );
}

// ─── COMPONENT: THẺ TRẠM TRÚ ẨN ──────────────────────────────────────────────
function ShelterCard({ shelter, onClose }) {
  const openRealNavigation = () => {
    const { latitude, longitude } = shelter.coordinate;
    const url = Platform.select({
      ios: `http://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`,
      android: `google.navigation:q=${latitude},${longitude}`
    });
    Linking.openURL(url).catch(() => Alert.alert('Lỗi', 'Không thể mở ứng dụng bản đồ.'));
  };

  return (
    <>
      <TouchableOpacity style={s.closeBtn} onPress={onClose}><Text style={s.closeTxt}>✕</Text></TouchableOpacity>
      <View style={s.statusDot}><View style={s.dot} /><Text style={s.statusTxt}>{shelter.status}</Text></View>
      <Text style={s.cardTitle}>{shelter.name}</Text>
      <Text style={s.cardAddr}>📍 {shelter.address}, {shelter.distance}</Text>
      <View style={s.metaRow}>
        <View style={s.metaCell}>
          <Text style={s.metaIcon}>👥</Text>
          <Text style={s.metaLabel}>Capacity</Text>
          <Text style={s.metaVal}>{shelter.capacity} / {shelter.maxCapacity}</Text>
        </View>
        <View style={s.metaCell}>
          <Text style={s.metaIcon}>🐾</Text>
          <Text style={s.metaLabel}>Pet Friendly</Text>
          <Text style={s.metaVal}>{shelter.petFriendly ? 'Yes' : 'No'}</Text>
        </View>
      </View>
      <View style={s.cardActions}>
        <TouchableOpacity style={s.navBtn} onPress={openRealNavigation}>
          <Text style={s.navBtnTxt}>➤  Start Navigation</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.iconBtn}><Text style={s.iconBtnTxt}>📞</Text></TouchableOpacity>
      </View>
    </>
  );
}

// ─── COMPONENT: THẺ THẢM HỌA ─────────────────────────────────────────────────
function DisasterCard({ marker, onClose }) {
  const cfg = MARKER_CONFIG[marker.type] || MARKER_CONFIG.other;
  const sev = SEVERITY_CONFIG[marker.severity] || SEVERITY_CONFIG.low;
  return (
    <>
      <TouchableOpacity style={s.closeBtn} onPress={onClose}><Text style={s.closeTxt}>✕</Text></TouchableOpacity>
      <View style={s.disasterHeader}>
        <View style={[s.disIconWrap, { backgroundColor: cfg.bgColor }]}>
          <Text style={{ fontSize: 24 }}>{cfg.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={[s.badge, { backgroundColor: sev.bgColor, alignSelf: 'flex-start' }]}>
            <Text style={[s.badgeText, { color: sev.textColor || sev.color }]}>{sev.label}</Text>
          </View>
          <Text style={s.cardTitle} numberOfLines={2}>{marker.title}</Text>
          <Text style={s.cardAddr}>{cfg.label} • {timeAgo(marker.time)}</Text>
        </View>
      </View>
      {marker.magnitude != null && (
        <Text style={[s.magText, { color: sev.color }]}>Magnitude M{marker.magnitude.toFixed(1)}</Text>
      )}
      <Text style={s.cardDesc} numberOfLines={3}>{marker.description || 'Đang cập nhật chi tiết tình hình...'}</Text>
    </>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  headerSafe: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: Platform.OS === 'android' ? 40 : 0 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', margin: 12, paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16,
    borderWidth: 1, borderColor: C.outlineVariant, height: 50, gap: 10,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
  },
  searchIcon: { fontSize: 18 },
  searchInput: { flex: 1, fontSize: 15, color: C.onSurface, fontWeight: '500' },
  clearSearch: { fontSize: 18, color: C.onSurfaceVariant, padding: 4 },
  filterRow: { paddingHorizontal: 12, paddingBottom: 10, gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.95)', borderWidth: 1.5, borderColor: C.outlineVariant,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  pillActive: { backgroundColor: C.primary, borderColor: C.primary },
  pillEmoji: { fontSize: 14 },
  pillLabel: { fontSize: 13, fontWeight: '600', color: C.onSurface },
  pillLabelActive: { color: '#fff' },
  controls: { position: 'absolute', right: 12, top: SH * 0.22, gap: 12 },
  ctrlBtn: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1, borderColor: C.outlineVariant, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
  },
  ctrlIcon: { fontSize: 20 },
  loadingBox: {
    position: 'absolute', top: 120, alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16,
    paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', gap: 10, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 6,
  },
  loadingText: { fontSize: 14, color: C.onSurface, fontWeight: '600' },
  detailCard: {
    position: 'absolute', bottom: 30, left: 12, right: 12,
    backgroundColor: 'rgba(255,255,255,0.98)', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: C.outlineVariant,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { width: 0, height: -4 }, elevation: 12,
  },
  cardHandle: { width: 40, height: 4, backgroundColor: C.outlineVariant, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  closeBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10, width: 30, height: 30, borderRadius: 15, backgroundColor: C.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  closeTxt: { fontSize: 12, color: C.onSurfaceVariant, fontWeight: '700' },
  statusDot: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16a34a' },
  statusTxt: { fontSize: 13, fontWeight: '700', color: '#16a34a' },
  cardTitle: { fontSize: 22, fontWeight: '800', color: C.onSurface, lineHeight: 28, marginBottom: 4 },
  cardAddr: { fontSize: 14, color: C.onSurfaceVariant, marginBottom: 16 },
  metaRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  metaCell: { flex: 1, backgroundColor: C.surfaceContainer, borderRadius: 16, padding: 14, alignItems: 'flex-start' },
  metaIcon: { fontSize: 20, marginBottom: 6 },
  metaLabel: { fontSize: 11, color: C.onSurfaceVariant, fontWeight: '700', textTransform: 'uppercase' },
  metaVal: { fontSize: 15, fontWeight: '800', color: C.onSurface, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 10 },
  navBtn: { flex: 1, height: 50, backgroundColor: C.primary, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  navBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '800', textTransform: 'uppercase' },
  iconBtn: { width: 50, height: 50, borderRadius: 14, backgroundColor: C.surfaceContainer, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.outlineVariant },
  iconBtnTxt: { fontSize: 20 },
  disasterHeader: { flexDirection: 'row', gap: 14, marginBottom: 12 },
  disIconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 6 },
  badgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  magText: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  cardDesc: { fontSize: 14, color: C.onSurfaceVariant, lineHeight: 22 },
});

const ms = StyleSheet.create({
  pin: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 5,
  },
});