import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import * as Location from 'expo-location';

import { fetchAllDisasterData } from '../api/disasterApiService';
import { MARKER_CONFIG, SEVERITY_CONFIG, SOURCE_LABELS } from '../constants/markerConfig';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── FILTER CATEGORIES ────────────────────────────────────────────────────────
const FILTER_TABS = [
  { id: 'all',        label: 'All',        emoji: '⚡' },
  { id: 'earthquake', label: 'Earthquake', emoji: '🌋' },
  { id: 'flood',      label: 'Flood',      emoji: '🌊' },
  { id: 'cyclone',    label: 'Cyclone',    emoji: '🌀' },
  { id: 'storm',      label: 'Storm',      emoji: '⛈️' },
  { id: 'wildfire',   label: 'Wildfire',   emoji: '🔥' },
  { id: 'volcano',    label: 'Volcano',    emoji: '🌋' },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const timeAgo = (iso) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

/** Custom glassmorphism map marker pin */
const DisasterMarkerPin = ({ marker, onPress, isSelected }) => {
  const config = MARKER_CONFIG[marker.type] || MARKER_CONFIG.other;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isSelected) {
      Animated.spring(scaleAnim, { toValue: 1.3, useNativeDriver: true }).start();
    } else {
      Animated.spring(scaleAnim, { toValue: 1.0, useNativeDriver: true }).start();
    }
  }, [isSelected]);

  return (
    <Marker
      coordinate={marker.coordinate}
      onPress={() => onPress(marker)}
      tracksViewChanges={false}
    >
      <Animated.View style={[styles.markerWrap, { transform: [{ scale: scaleAnim }] }]}>
        <View
          style={[
            styles.markerPin,
            {
              backgroundColor: config.bgColor,
              borderColor: isSelected ? '#ffffff' : config.color,
              borderWidth: isSelected ? 3 : 2,
              shadowColor: config.color,
            },
          ]}
        >
          <Text style={styles.markerEmoji}>{config.emoji}</Text>
        </View>
        {/* Pin tail */}
        <View style={[styles.markerTail, { borderTopColor: config.color }]} />
        {/* Ping ring for critical */}
        {marker.severity === 'critical' && (
          <View style={[styles.pingRing, { borderColor: config.color }]} />
        )}
      </Animated.View>
    </Marker>
  );
};

/** Hazard influence circle overlay */
const HazardCircle = ({ marker }) => {
  const config = MARKER_CONFIG[marker.type] || MARKER_CONFIG.other;
  const radiusMap = { critical: 80000, high: 40000, moderate: 20000, low: 10000 };
  return (
    <Circle
      center={marker.coordinate}
      radius={radiusMap[marker.severity] || 20000}
      strokeColor={config.color + '60'}
      fillColor={config.color + '15'}
      strokeWidth={1}
    />
  );
};

/** Filter pill tab */
const FilterPill = ({ item, active, onPress }) => (
  <TouchableOpacity
    style={[styles.filterPill, active && styles.filterPillActive]}
    onPress={() => onPress(item.id)}
    activeOpacity={0.75}
  >
    <Text style={styles.filterPillEmoji}>{item.emoji}</Text>
    <Text style={[styles.filterPillLabel, active && styles.filterPillLabelActive]}>
      {item.label}
    </Text>
  </TouchableOpacity>
);

/** Source badge chip */
const SourceBadge = ({ source }) => (
  <View style={styles.sourceBadge}>
    <Text style={styles.sourceBadgeText}>{SOURCE_LABELS[source] || source}</Text>
  </View>
);

/** Alert detail bottom-sheet card (glassmorphism style) */
const AlertDetailCard = ({ marker, onClose }) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const config = MARKER_CONFIG[marker.type] || MARKER_CONFIG.other;
  const severityCfg = SEVERITY_CONFIG[marker.severity] || SEVERITY_CONFIG.low;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [marker.id]);

  return (
    <Animated.View
      style={[styles.detailCard, { transform: [{ translateY: slideAnim }] }]}
    >
      {/* Handle bar */}
      <View style={styles.cardHandle} />

      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconWrap, { backgroundColor: config.bgColor }]}>
          <Text style={{ fontSize: 24 }}>{config.emoji}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={styles.cardBadgeRow}>
            <View style={[styles.severityBadge, { backgroundColor: severityCfg.bgColor }]}>
              <Text style={[styles.severityText, { color: severityCfg.color }]}>
                {severityCfg.label}
              </Text>
            </View>
            <SourceBadge source={marker.source} />
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {marker.title}
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Description */}
      <Text style={styles.cardDesc}>{marker.description}</Text>

      {/* Metadata grid */}
      <View style={styles.metaGrid}>
        <View style={styles.metaCell}>
          <Text style={styles.metaLabel}>TYPE</Text>
          <Text style={styles.metaValue}>{config.label}</Text>
        </View>
        {marker.magnitude != null && (
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>MAGNITUDE</Text>
            <Text style={[styles.metaValue, { color: severityCfg.color }]}>
              M{marker.magnitude.toFixed(1)}
            </Text>
          </View>
        )}
        {marker.alertLevel && (
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>ALERT LEVEL</Text>
            <Text style={[styles.metaValue, { color: severityCfg.color }]}>
              {marker.alertLevel}
            </Text>
          </View>
        )}
        <View style={styles.metaCell}>
          <Text style={styles.metaLabel}>ISSUED</Text>
          <Text style={styles.metaValue}>{timeAgo(marker.time)}</Text>
        </View>
        <View style={[styles.metaCell, { flex: 2 }]}>
          <Text style={styles.metaLabel}>COORDINATES</Text>
          <Text style={styles.metaValue}>
            {marker.coordinate.latitude.toFixed(3)}°N,{' '}
            {marker.coordinate.longitude.toFixed(3)}°E
          </Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.actionBtn, { borderColor: config.color }]}>
          <Text style={[styles.actionBtnText, { color: config.color }]}>📋 Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtnPrimary, { backgroundColor: config.color }]}
        >
          <Text style={styles.actionBtnPrimaryText}>🗺️ Navigate</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────

export default function DisasterMapScreen() {
  const mapRef = useRef(null);

  // State
  const [markers, setMarkers] = useState([]);
  const [filteredMarkers, setFilteredMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [statsVisible, setStatsVisible] = useState(true);

  // Stats
  const criticalCount = markers.filter((m) => m.severity === 'critical').length;
  const totalCount = markers.length;

  // ── Load data ───────────────────────────────────────────────────────────────
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const data = await fetchAllDisasterData(userLocation);
      setMarkers(data);
    } catch (err) {
      setError('Failed to load disaster data. Pull down to retry.');
      console.error('[DisasterMapScreen]', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userLocation]);

  // ── Request user location ────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    })();
  }, []);

  // ── Initial data load ────────────────────────────────────────────────────────
  useEffect(() => {
    loadData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => loadData(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  // ── Filter logic ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredMarkers(markers);
    } else {
      setFilteredMarkers(markers.filter((m) => m.type === activeFilter));
    }
  }, [markers, activeFilter]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleMarkerPress = useCallback((marker) => {
    setSelectedMarker(marker);
    mapRef.current?.animateToRegion(
      {
        ...marker.coordinate,
        latitudeDelta: 3,
        longitudeDelta: 3,
      },
      600
    );
  }, []);

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    setSelectedMarker(null);
  };

  const handleMyLocation = useCallback(() => {
    if (userLocation) {
      mapRef.current?.animateToRegion(
        { ...userLocation, latitudeDelta: 5, longitudeDelta: 5 },
        600
      );
    }
  }, [userLocation]);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>

      {/* ── MAP ── */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        mapType="standard"
        initialRegion={{
          latitude: 10.762622,
          longitude: 106.660172,
          latitudeDelta: 40,
          longitudeDelta: 40,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {filteredMarkers.map((marker) => (
          <React.Fragment key={marker.id}>
            <DisasterMarkerPin
              marker={marker}
              onPress={handleMarkerPress}
              isSelected={selectedMarker?.id === marker.id}
            />
            {(marker.severity === 'critical' || marker.severity === 'high') && (
              <HazardCircle marker={marker} />
            )}
          </React.Fragment>
        ))}
      </MapView>

      {/* ── HEADER / STATS BAR ── */}
      <View style={styles.statsBar}>
        <View style={styles.statsBarContent}>
          <View>
            <Text style={styles.statsTitle}>🛡️ StormShield</Text>
            <Text style={styles.statsSubtitle}>
              {isLoading ? 'Fetching alerts...' : `${totalCount} events • ${criticalCount} critical`}
            </Text>
          </View>
          <View style={styles.statsRight}>
            {isLoading && <ActivityIndicator color="#ba1a1a" size="small" style={{ marginRight: 8 }} />}
            <TouchableOpacity onPress={() => loadData(true)} style={styles.refreshBtn}>
              <Text style={styles.refreshBtnText}>↻</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── FILTER PILLS ── */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_TABS.map((tab) => (
            <FilterPill
              key={tab.id}
              item={tab}
              active={activeFilter === tab.id}
              onPress={handleFilterChange}
            />
          ))}
        </ScrollView>
      </View>

      {/* ── MAP CONTROLS ── */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.mapControlBtn} onPress={handleMyLocation}>
          <Text style={styles.mapControlIcon}>📍</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.mapControlBtn}
          onPress={() => mapRef.current?.animateToRegion({
            latitude: 10.762622, longitude: 106.660172,
            latitudeDelta: 40, longitudeDelta: 40,
          }, 600)}
        >
          <Text style={styles.mapControlIcon}>🌐</Text>
        </TouchableOpacity>
      </View>

      {/* ── ERROR TOAST ── */}
      {error && (
        <View style={styles.errorToast}>
          <Text style={styles.errorToastText}>⚠️ {error}</Text>
        </View>
      )}

      {/* ── LOADING OVERLAY ── */}
      {isLoading && markers.length === 0 && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator color="#ba1a1a" size="large" />
            <Text style={styles.loadingText}>Fetching real-time alerts…</Text>
            <Text style={styles.loadingSubtext}>USGS • GDACS • NASA EONET</Text>
          </View>
        </View>
      )}

      {/* ── SELECTED ALERT DETAIL CARD ── */}
      {selectedMarker && (
        <AlertDetailCard
          marker={selectedMarker}
          onClose={() => setSelectedMarker(null)}
        />
      )}
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const GLASS = {
  backgroundColor: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(20px)',
  borderRadius: 16,
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    android: { elevation: 8 },
  }),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  // ── Marker ──
  markerWrap: {
    alignItems: 'center',
  },
  markerPin: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6 },
      android: { elevation: 6 },
    }),
  },
  markerEmoji: {
    fontSize: 20,
  },
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  pingRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    opacity: 0.4,
  },

  // ── Stats Bar ──
  statsBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'ios' ? 52 : 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196,198,204,0.4)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  statsBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsTitle: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '900',
    color: '#041525',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statsSubtitle: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#44474c',
    marginTop: 2,
  },
  statsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(186,26,26,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshBtnText: {
    fontSize: 20,
    color: '#ba1a1a',
    fontWeight: '700',
  },

  // ── Filter Bar ──
  filterBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 108 : 72,
    left: 0,
    right: 0,
  },
  filterScroll: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
    flexDirection: 'row',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1.5,
    borderColor: 'rgba(196,198,204,0.6)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  filterPillActive: {
    backgroundColor: '#041525',
    borderColor: '#041525',
  },
  filterPillEmoji: { fontSize: 14 },
  filterPillLabel: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600',
    color: '#191c1d',
  },
  filterPillLabelActive: {
    color: '#ffffff',
  },

  // ── Map Controls ──
  mapControls: {
    position: 'absolute',
    right: 16,
    top: Platform.OS === 'ios' ? 170 : 130,
    gap: 8,
  },
  mapControlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    ...GLASS,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(196,198,204,0.5)',
  },
  mapControlIcon: { fontSize: 20 },

  // ── Loading Overlay ──
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248,249,250,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    ...GLASS,
    paddingHorizontal: 32,
    paddingVertical: 28,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(196,198,204,0.4)',
  },
  loadingText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: '#191c1d',
    marginTop: 8,
  },
  loadingSubtext: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#74777d',
    letterSpacing: 0.5,
  },

  // ── Error Toast ──
  errorToast: {
    position: 'absolute',
    bottom: 200,
    left: 16,
    right: 16,
    backgroundColor: '#ffdad6',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ba1a1a40',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#ba1a1a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  errorToastText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600',
    color: '#410002',
    textAlign: 'center',
  },

  // ── Detail Card (Glassmorphism Bottom Sheet) ──
  detailCard: {
    position: 'absolute',
    bottom: 90, // above bottom nav bar
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(196,198,204,0.5)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: { elevation: 12 },
    }),
  },
  cardHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#c4c6cc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  severityText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(80,96,114,0.10)',
  },
  sourceBadgeText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    color: '#506072',
  },
  cardTitle: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '700',
    color: '#191c1d',
    lineHeight: 20,
  },
  closeBtn: {
    marginLeft: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#edeeef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    color: '#44474c',
    fontWeight: '700',
  },
  cardDesc: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#44474c',
    lineHeight: 19,
    marginBottom: 14,
  },

  // Metadata grid
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  metaCell: {
    flex: 1,
    minWidth: 80,
    backgroundColor: '#f3f4f5',
    borderRadius: 10,
    padding: 10,
  },
  metaLabel: {
    fontFamily: 'Inter',
    fontSize: 9,
    fontWeight: '700',
    color: '#74777d',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  metaValue: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    color: '#191c1d',
  },

  // Action buttons
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnPrimary: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPrimaryText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
