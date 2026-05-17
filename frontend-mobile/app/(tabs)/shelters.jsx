import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Platform, ActivityIndicator, Animated,
  SafeAreaView, Dimensions, Linking, Alert
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';

import { C } from '../../src/constants/colors';
import { fetchAllDisasterData, fetchInternalShelters } from '../../src/api/disasterApiService';
import { MARKER_CONFIG, SEVERITY_CONFIG } from '../../src/constants/markerConfig';

const { height: SH } = Dimensions.get('window');

const VN_BOUNDS = {
  latMin: 8.5, latMax: 23.4,
  lonMin: 102.1, lonMax: 109.5
};

function timeAgo(iso) {
  if (!iso) return 'Unknown';
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export default function ShelterMapScreen() {
  const mapRef = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [internalShelters, setInternalShelters] = useState([]); // 🟢 State cho dữ liệu BE
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isVNOnly, setIsVNOnly] = useState(false); // 🟢 State lọc Việt Nam
  const [selected, setSelected] = useState(null); 
  const [selectedType, setSelectedType] = useState(null); 
  const slideAnim = useRef(new Animated.Value(400)).current;

  const [searchQuery, setSearchQuery] = useState('');
  const [userLoc, setUserLoc] = useState(null);
  const [searchedLoc, setSearchedLoc] = useState(null);

  // 🟢 Load dữ liệu Hybrid (NASA/USGS + StormShield BE)
  const loadMapData = async (loc = null) => {
    try {
      const [disasterData, shelterData] = await Promise.all([
        fetchAllDisasterData(loc),
        fetchInternalShelters() // Gọi API thật từ shelter-service
      ]);
      setMarkers(disasterData);
      setInternalShelters(shelterData);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

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
      loadMapData(loc);
    })();
  }, []);

  // 🟢 Logic lọc tọa độ Việt Nam cho cả Thảm họa và Trạm trú ẩn
  const applyFilters = (data) => {
    return data.filter(item => {
      if (isVNOnly) {
        const { latitude: lat, longitude: lon } = item.coordinate;
        return lat >= VN_BOUNDS.latMin && lat <= VN_BOUNDS.latMax &&
               lon >= VN_BOUNDS.lonMin && lon <= VN_BOUNDS.lonMax;
      }
      return true;
    });
  };

  const filteredDisasters = applyFilters(filter === 'all' ? markers : markers.filter(m => m.type === filter));
  const filteredShelters = applyFilters(internalShelters);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const results = await Location.geocodeAsync(searchQuery);
      if (results.length > 0) {
        const loc = results[0];
        setSearchedLoc({ latitude: loc.latitude, longitude: loc.longitude });
        mapRef.current?.animateToRegion({ latitude: loc.latitude, longitude: loc.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }, 1000);
      }
    } catch (error) { Alert.alert("Lỗi", "Không tìm thấy địa chỉ."); }
  };

  const selectItem = (item, type) => {
    setSelected(item);
    setSelectedType(type);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
    mapRef.current?.animateToRegion({ ...item.coordinate, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 500);
  };

  const dismissCard = () => {
    Animated.timing(slideAnim, { toValue: 400, duration: 200, useNativeDriver: true }).start(() => setSelected(null));
  };

  return (
    <View style={s.root}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_DEFAULT}
        initialRegion={{ latitude: 10.7626, longitude: 106.6601, latitudeDelta: 0.3, longitudeDelta: 0.3 }}
        showsUserLocation
      >
        {/* 🟢 Vẽ Shelter thật từ Backend */}
        {filteredShelters.map(sh => (
          <Marker key={sh.id} coordinate={sh.coordinate} onPress={() => selectItem(sh, 'shelter')} zIndex={100}>
            <View style={[ms.pin, { backgroundColor: '#fff', borderColor: C.primary, borderWidth: 3 }]}>
              <Text style={{fontSize: 18}}>🏠</Text>
            </View>
          </Marker>
        ))}

        {/* Vẽ thảm họa */}
        {filteredDisasters.map(m => {
          const cfg = MARKER_CONFIG[m.type] || MARKER_CONFIG.other;
          return (
            <Marker key={m.id} coordinate={m.coordinate} onPress={() => selectItem(m, 'disaster')} zIndex={10}>
              <View style={[ms.pin, { backgroundColor: cfg.bgColor, borderColor: cfg.color }]}>
                <Text style={{fontSize: 16}}>{cfg.emoji}</Text>
              </View>
            </Marker>
          );
        })}

        {searchedLoc && (
          <Marker coordinate={searchedLoc} zIndex={150}>
            <View style={[ms.pin, { backgroundColor: '#111827', borderColor: '#fff', borderWidth: 2 }]}><Text>🎯</Text></View>
          </Marker>
        )}
      </MapView>

      <SafeAreaView style={s.headerSafe}>
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput 
            style={s.searchInput} 
            placeholder="Search location..." 
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {/* 🟢 Nút lọc Việt Nam */}
          <TouchableOpacity 
            onPress={() => setIsVNOnly(!isVNOnly)}
            style={[s.vnToggle, isVNOnly && s.vnToggleActive]}
          >
            <Text style={[s.vnToggleTxt, isVNOnly && s.vnToggleTxtActive]}>{isVNOnly ? '🇻🇳 VN' : '🌐 All'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
          <TouchableOpacity style={[s.pill, filter === 'all' && s.pillActive]} onPress={() => setFilter('all')}>
            <Text style={[s.pillLabel, filter === 'all' && s.pillLabelActive]}>🌐 All Alerts</Text>
          </TouchableOpacity>
          {Object.keys(MARKER_CONFIG).filter(k => k !== 'other').map(key => (
            <TouchableOpacity key={key} style={[s.pill, filter === key && s.pillActive]} onPress={() => setFilter(key)}>
              <Text style={s.pillEmoji}>{MARKER_CONFIG[key].emoji}</Text>
              <Text style={[s.pillLabel, filter === key && s.pillLabelActive]}>{MARKER_CONFIG[key].label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      <View style={s.controls}>
        <TouchableOpacity style={s.ctrlBtn} onPress={() => mapRef.current?.animateToRegion({ ...userLoc, latitudeDelta: 0.05, longitudeDelta: 0.05 })}><Text>📍</Text></TouchableOpacity>
      </View>

      {loading && (
        <View style={s.loadingBox}>
          <ActivityIndicator color={C.secondary} />
          <Text style={s.loadingText}>Syncing with StormShield BE…</Text>
        </View>
      )}

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
function ShelterCard({ shelter, onClose }) {
  // 1. Map màu sắc trạng thái dựa trên ShelterStatus của Backend
  const statusColor = shelter.status === 'AVAILABLE' ? '#16a34a' : '#ba1a1a';

  // 2. Logic điều hướng thông minh (Hỗ trợ cả iOS và Android)
  const openNavigation = () => {
    const { latitude, longitude } = shelter;
    
    // Giao thức maps:// dùng cho iOS, google.navigation cho Android
    const url = Platform.select({
      ios: `maps://app?daddr=${latitude},${longitude}`, 
      android: `google.navigation:q=${latitude},${longitude}`
    });

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Phương án dự phòng nếu Simulator không có app bản đồ
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
      }
    });
  };

  return (
    <>
      <TouchableOpacity style={s.closeBtn} onPress={onClose}>
        <Text style={s.closeTxt}>✕</Text>
      </TouchableOpacity>

      <View style={s.statusDot}>
        <View style={[s.dot, { backgroundColor: statusColor }]} />
        <Text style={[s.statusTxt, { color: statusColor }]}>{shelter.status}</Text>
      </View>

      <Text style={s.cardTitle}>{shelter.name}</Text>
      <Text style={s.cardAddr}>📍 {shelter.address || 'StormShield Verified Location'}</Text>

      <View style={s.metaRow}>
        <View style={s.metaCell}>
          <Text style={s.metaLabel}>Occupancy</Text>
          {/* Map đúng currentOccupancy và capacity từ Backend */}
          <Text style={s.metaVal}>{shelter.capacity} / {shelter.maxCapacity}</Text>
        </View>
        <View style={s.metaCell}>
          <Text style={s.metaLabel}>Managed By</Text>
          <Text style={s.metaVal}>{shelter.managedBy || 'Official'}</Text>
        </View>
      </View>

      {/* 3. Nút điều hướng đã được cập nhật logic openNavigation */}
      <TouchableOpacity style={s.navBtn} onPress={openNavigation} activeOpacity={0.8}>
        <Text style={s.navBtnTxt}>➤  Bắt đầu đi đến</Text>
      </TouchableOpacity>
    </>
  );
}

function DisasterCard({ marker, onClose }) {
  const cfg = MARKER_CONFIG[marker.type] || MARKER_CONFIG.other;
  const sev = SEVERITY_CONFIG[marker.severity] || SEVERITY_CONFIG.low;
  return (
    <>
      <TouchableOpacity style={s.closeBtn} onPress={onClose}><Text>✕</Text></TouchableOpacity>
      <View style={s.disasterHeader}>
        <View style={[s.disIconWrap, { backgroundColor: cfg.bgColor }]}>
          <Text style={{ fontSize: 24 }}>{cfg.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={[s.badge, { backgroundColor: sev.bgColor }]}>
            <Text style={[s.badgeText, { color: sev.textColor || sev.color }]}>{sev.label}</Text>
          </View>
          <Text style={s.cardTitle}>{marker.title}</Text>
          <Text style={s.cardAddr}>{cfg.label} • {marker.source} • {timeAgo(marker.time)}</Text>
        </View>
      </View>
      <Text style={s.cardDesc} numberOfLines={3}>{marker.description}</Text>
    </>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  headerSafe: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: Platform.OS === 'android' ? 40 : 0 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', margin: 12, paddingHorizontal: 14,
    backgroundColor: '#fff', borderRadius: 16, height: 52, gap: 10, elevation: 5,
  },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '600' },
  vnToggle: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: C.surfaceContainerHigh },
  vnToggleActive: { backgroundColor: '#DA251D' },
  vnToggleTxt: { fontSize: 11, fontWeight: '800', color: C.onSurfaceVariant },
  vnToggleTxtActive: { color: '#FFFF00' },
  filterRow: { paddingHorizontal: 12, paddingBottom: 10, gap: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, backgroundColor: '#fff', borderWidth: 1, borderColor: C.outlineVariant },
  pillActive: { backgroundColor: C.primary, borderColor: C.primary },
  pillLabel: { fontSize: 12, fontWeight: '700', color: C.onSurface },
  pillLabelActive: { color: '#fff' },
  controls: { position: 'absolute', right: 12, top: SH * 0.25 },
  ctrlBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  loadingBox: { position: 'absolute', top: 130, alignSelf: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 12, flexDirection: 'row', gap: 10, alignItems: 'center', elevation: 6 },
  detailCard: { position: 'absolute', bottom: 30, left: 12, right: 12, backgroundColor: '#fff', borderRadius: 24, padding: 20, elevation: 15 },
  cardHandle: { width: 40, height: 4, backgroundColor: C.outlineVariant, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  closeBtn: { position: 'absolute', top: 16, right: 16, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  statusDot: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusTxt: { fontSize: 13, fontWeight: '800' },
  cardTitle: { fontSize: 20, fontWeight: '800', color: C.onSurface, marginBottom: 4 },
  cardAddr: { fontSize: 13, color: C.onSurfaceVariant, marginBottom: 16 },
  metaRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  metaCell: { flex: 1, backgroundColor: C.surfaceContainer, borderRadius: 12, padding: 12 },
  metaLabel: { fontSize: 10, fontWeight: '700', color: C.onSurfaceVariant, textTransform: 'uppercase' },
  metaVal: { fontSize: 16, fontWeight: '800', color: C.onSurface, marginTop: 2 },
  navBtn: { height: 50, backgroundColor: C.primary, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  navBtnTxt: { color: '#fff', fontWeight: '800' },
  disasterHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  disIconWrap: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  cardDesc: { fontSize: 14, color: C.onSurfaceVariant, lineHeight: 20 },
});

const ms = StyleSheet.create({
  pin: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 5 },
});