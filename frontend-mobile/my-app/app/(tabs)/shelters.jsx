import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Platform, ActivityIndicator, Animated,
  SafeAreaView, Dimensions,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { C } from '../../src/constants/colors';
import { fetchAllDisasterData } from '../../src/api/disasterApiService';
import { MARKER_CONFIG, SEVERITY_CONFIG } from '../../src/constants/markerConfig';

const { height: SH } = Dimensions.get('window');

const FILTERS = [
  { id: 'all', label: 'All', emoji: '⚡' },
  { id: 'flood', label: 'Flood Zones', emoji: '🌊' },
  { id: 'wildfire', label: 'Fire Risks', emoji: '🔥' },
  { id: 'earthquake', label: 'Earthquakes', emoji: '🌋' },
  { id: 'storm', label: 'Storms', emoji: '⛈️' },
];

// Shelter mock data
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
  const [selected, setSelected] = useState(null); // can be disaster or shelter
  const [selectedType, setSelectedType] = useState(null); // 'disaster' | 'shelter'
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    (async () => {
      let loc = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        }
      } catch (_) {}
      try {
        const data = await fetchAllDisasterData(loc);
        setMarkers(data.slice(0, 100));
      } catch (e) { console.warn(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = filter === 'all' ? markers : markers.filter(m => m.type === filter);

  const selectItem = (item, type) => {
    setSelected(item);
    setSelectedType(type);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
    mapRef.current?.animateToRegion({ ...item.coordinate, latitudeDelta: 0.05, longitudeDelta: 0.05 }, 500);
  };

  const dismissCard = () => {
    Animated.timing(slideAnim, { toValue: 300, duration: 200, useNativeDriver: true }).start(() => {
      setSelected(null);
    });
  };

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
        {/* Disaster markers */}
        {filtered.map(m => {
          const cfg = MARKER_CONFIG[m.type] || MARKER_CONFIG.other;
          return (
            <Marker key={m.id} coordinate={m.coordinate} onPress={() => selectItem(m, 'disaster')}>
              <View style={[ms.pin, { backgroundColor: cfg.bgColor, borderColor: cfg.color }]}>
                <Text>{cfg.emoji}</Text>
              </View>
            </Marker>
          );
        })}
        {/* Shelter markers */}
        {SHELTERS.map(sh => (
          <Marker key={sh.id} coordinate={sh.coordinate} onPress={() => selectItem(sh, 'shelter')}>
            <View style={[ms.pin, { backgroundColor: '#e3f2fd', borderColor: C.primary }]}>
              <Text>🏠</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* HEADER */}
      <SafeAreaView style={s.headerSafe}>
        <View style={s.header}>
          <TouchableOpacity><Text style={s.menuIcon}>☰</Text></TouchableOpacity>
          <Text style={s.brand}>STORMSHIELD</Text>
          <TouchableOpacity><Text style={s.personIcon}>👤</Text></TouchableOpacity>
        </View>
        {/* Search */}
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput style={s.searchInput} placeholder="Search address or area..." placeholderTextColor={C.outline} />
          <TouchableOpacity><Text style={s.micIcon}>🎤</Text></TouchableOpacity>
        </View>
        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.id}
              style={[s.pill, filter === f.id && s.pillActive]}
              onPress={() => setFilter(f.id)}
            >
              <Text style={s.pillEmoji}>{f.emoji}</Text>
              <Text style={[s.pillLabel, filter === f.id && s.pillLabelActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* MAP CONTROLS */}
      <View style={s.controls}>
        <TouchableOpacity style={s.ctrlBtn}><Text>📍</Text></TouchableOpacity>
        <TouchableOpacity style={s.ctrlBtn} onPress={() => router.push('/disaster-map')}>
          <Text>🗺️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.ctrlBtn}><Text>＋</Text></TouchableOpacity>
        <TouchableOpacity style={s.ctrlBtn}><Text>－</Text></TouchableOpacity>
      </View>

      {/* LOADING */}
      {loading && (
        <View style={s.loadingBox}>
          <ActivityIndicator color={C.error} />
          <Text style={s.loadingText}>Loading alerts…</Text>
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

function ShelterCard({ shelter, onClose }) {
  const pct = Math.round((shelter.capacity / shelter.maxCapacity) * 100);
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
          <Text style={s.metaVal}>{shelter.petFriendly ? 'Yes (Crated)' : 'No'}</Text>
        </View>
      </View>
      <View style={s.cardActions}>
        <TouchableOpacity
          style={s.navBtn}
          onPress={() => router.push({ pathname: '/shelter-navigation', params: { id: shelter.id } })}
        >
          <Text style={s.navBtnTxt}>➤  Navigate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.iconBtn}><Text style={s.iconBtnTxt}>📞</Text></TouchableOpacity>
        <TouchableOpacity style={s.iconBtn}><Text style={s.iconBtnTxt}>🔗</Text></TouchableOpacity>
      </View>
    </>
  );
}

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
            <Text style={[s.badgeText, { color: sev.color }]}>{sev.label}</Text>
          </View>
          <Text style={s.cardTitle} numberOfLines={2}>{marker.title}</Text>
          <Text style={s.cardAddr}>{cfg.label} • {timeAgo(marker.time)}</Text>
        </View>
      </View>
      {marker.magnitude && (
        <Text style={[s.magText, { color: sev.color }]}>Magnitude M{marker.magnitude.toFixed(1)}</Text>
      )}
      <Text style={s.cardDesc} numberOfLines={2}>{marker.description}</Text>
    </>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  headerSafe: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderBottomWidth: 1, borderBottomColor: C.outlineVariant,
  },
  menuIcon: { fontSize: 22 },
  brand: { fontSize: 15, fontWeight: '900', color: C.primary, letterSpacing: 2 },
  personIcon: { fontSize: 22 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    margin: 12, paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 999, borderWidth: 1, borderColor: C.outlineVariant,
    height: 46, gap: 8,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: C.onSurface },
  micIcon: { fontSize: 16 },
  filterRow: { paddingHorizontal: 12, paddingBottom: 10, gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1.5, borderColor: C.outlineVariant,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  pillActive: { backgroundColor: C.primary, borderColor: C.primary },
  pillEmoji: { fontSize: 14 },
  pillLabel: { fontSize: 13, fontWeight: '600', color: C.onSurface },
  pillLabelActive: { color: '#fff' },
  controls: {
    position: 'absolute', right: 12, top: SH * 0.28,
    gap: 8,
  },
  ctrlBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1, borderColor: C.outlineVariant,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
  },
  loadingBox: {
    position: 'absolute', bottom: 200, alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16,
    padding: 16, flexDirection: 'row', gap: 10, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 6,
  },
  loadingText: { fontSize: 13, color: C.onSurface, fontWeight: '600' },
  detailCard: {
    position: 'absolute', bottom: 70, left: 12, right: 12,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: C.outlineVariant,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 }, elevation: 12,
  },
  cardHandle: {
    width: 40, height: 4, backgroundColor: C.outlineVariant,
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  closeBtn: {
    position: 'absolute', top: 16, right: 16, zIndex: 10,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  closeTxt: { fontSize: 12, color: C.onSurfaceVariant, fontWeight: '700' },
  statusDot: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16a34a' },
  statusTxt: { fontSize: 12, fontWeight: '600', color: '#16a34a' },
  cardTitle: { fontSize: 22, fontWeight: '800', color: C.onSurface, lineHeight: 28, marginBottom: 4 },
  cardAddr: { fontSize: 13, color: C.onSurfaceVariant, marginBottom: 14 },
  metaRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  metaCell: {
    flex: 1, backgroundColor: C.surfaceContainer, borderRadius: 12, padding: 12, alignItems: 'flex-start',
  },
  metaIcon: { fontSize: 18, marginBottom: 4 },
  metaLabel: { fontSize: 10, color: C.onSurfaceVariant, fontWeight: '600', textTransform: 'uppercase' },
  metaVal: { fontSize: 14, fontWeight: '700', color: C.onSurface, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 10 },
  navBtn: {
    flex: 1, height: 48, backgroundColor: C.primary, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  navBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  iconBtn: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: C.surfaceContainer,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.outlineVariant,
  },
  iconBtnTxt: { fontSize: 20 },
  disasterHeader: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  disIconWrap: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 4 },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  magText: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: C.onSurfaceVariant, lineHeight: 19 },
});

const ms = StyleSheet.create({
  pin: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
});
