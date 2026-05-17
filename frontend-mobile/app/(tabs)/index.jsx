import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, RefreshControl, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { C } from '../../src/constants/colors';
import { fetchAllDisasterData } from '../../src/api/disasterApiService';
import { MARKER_CONFIG, SEVERITY_CONFIG } from '../../src/constants/markerConfig';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(iso) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return `${Math.floor(d)}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

function coordStr(coord) {
  const lat = `${Math.abs(coord.latitude).toFixed(1)}°${coord.latitude >= 0 ? 'N' : 'S'}`;
  const lon = `${Math.abs(coord.longitude).toFixed(1)}°${coord.longitude >= 0 ? 'E' : 'W'}`;
  return `${lat}, ${lon}`;
}

const VN_BOUNDS = {
  latMin: 8.5, latMax: 23.4,
  lonMin: 102.1, lonMax: 109.5
};

function markerToCard(marker, pinnedIds = []) {
  const cfg = MARKER_CONFIG[marker.type] || MARKER_CONFIG.other;
  const sev = SEVERITY_CONFIG[marker.severity] || SEVERITY_CONFIG.low;
  const isPinned = pinnedIds.includes(marker.id);
  const locationDisplayName = marker.provinceName || marker.placeName || coordStr(marker.coordinate);
  return {
    id: marker.id,
    severity: marker.severity,
    type: marker.type,
    label: cfg.label,
    title: marker.title,
    location: `${marker.source} · ${locationDisplayName}`,
    time: timeAgo(marker.time),
    timeRaw: new Date(marker.time).getTime(),
    icon: cfg.emoji,
    borderColor: cfg.color,
    badge: {
      label: sev.label,
      bg: sev.bgColor,
      text: sev.textColor || sev.color,
    },
    magnitude: marker.magnitude,
    url: marker.url,
    isPinned,
    raw: marker,
  };
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const [rawMarkers, setRawMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filterSev, setFilterSev] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [pinnedIds, setPinnedIds] = useState([]);
  const [isVNOnly, setIsVNOnly] = useState(false);

  const total = rawMarkers.length;
  const critical = rawMarkers.filter(m => m.severity === 'critical').length;
  const high = rawMarkers.filter(m => m.severity === 'high').length;
  const moderate = rawMarkers.filter(m => m.severity === 'moderate').length;

  const filteredData = rawMarkers
    .filter(m => filterSev === 'all' || m.severity === filterSev)
    .filter(m => filterType === 'all' || m.type === filterType)
    .filter(m => {
      if (!isVNOnly) return true;
      const { latitude: lat, longitude: lon } = m.coordinate;
      return lat >= VN_BOUNDS.latMin && lat <= VN_BOUNDS.latMax &&
        lon >= VN_BOUNDS.lonMin && lon <= VN_BOUNDS.lonMax;
    });

  const displayed = filteredData
    .map(m => markerToCard(m, pinnedIds))
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      const aIsCritical = a.severity === 'critical';
      const bIsCritical = b.severity === 'critical';
      if (aIsCritical !== bIsCritical) return aIsCritical ? -1 : 1;
      return b.timeRaw - a.timeRaw;
    })
    .slice(0, 30);

  const togglePin = useCallback((id) => {
    setPinnedIds(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  }, []);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await fetchAllDisasterData(null);
      setRawMarkers(data);
    } catch (e) {
      setError('Failed to load alerts. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const t = setInterval(() => loadData(true), 5 * 60 * 1000);
    return () => clearInterval(t);
  }, [loadData]);

  return (
    <SafeAreaView style={s.root}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ backgroundColor: C.background }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} colors={[C.secondary]} tintColor={C.secondary} />
        }
      >
        <View style={{ backgroundColor: C.surfaceContainerLowest, paddingBottom: 16 }}>
          <View style={s.titleWrap}>
            <View style={s.headerRow}>
              <View>
                <Text style={s.overline}>Command Center</Text>
                <Text style={s.pageTitle}>Overview</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsVNOnly(!isVNOnly)}
                style={[s.vnToggle, isVNOnly && s.vnToggleActive]}
              >
                <Text style={[s.vnToggleText, isVNOnly && s.vnToggleTextActive]}>
                  {isVNOnly ? '🇻🇳 Vietnam' : '🌐 Global'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={s.reportBtn} onPress={() => router.push('/(tabs)/report')} activeOpacity={0.85}>
            <Text style={s.reportBtnText}>＋  Báo cáo sự cố</Text>
          </TouchableOpacity>

          <View style={s.bento}>
            <TouchableOpacity style={[s.bentoCell, s.bentoCellTotal, filterSev === 'all' && s.bentoCellActive]} onPress={() => setFilterSev('all')}>
              <Text style={s.statLabel}>Active Alerts</Text>
              {loading ? <ActivityIndicator color={C.primary} size="small" /> : <Text style={s.statNum}>{total}</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.bentoCell, s.bentoCellSev, { backgroundColor: filterSev === 'critical' ? SEVERITY_CONFIG.critical.bgColor : SEVERITY_CONFIG.critical.bgColor + '88' }, filterSev === 'critical' && s.bentoCellActive]}
              onPress={() => setFilterSev(filterSev === 'critical' ? 'all' : 'critical')}
            >
              <Text style={[s.statLabel, { color: SEVERITY_CONFIG.critical.textColor }]}>Critical</Text>
              <View style={s.statRow}>
                <Text style={[s.statNum, { color: SEVERITY_CONFIG.critical.color }]}>{critical}</Text>
                {critical > 0 && <Text style={{ color: SEVERITY_CONFIG.critical.color, fontSize: 16, marginLeft: 4 }}>↑</Text>}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.bentoCell, s.bentoCellSev, { backgroundColor: filterSev === 'moderate' ? SEVERITY_CONFIG.moderate.bgColor : C.surfaceContainerLowest }, filterSev === 'moderate' && s.bentoCellActive]}
              onPress={() => setFilterSev(filterSev === 'moderate' ? 'all' : 'moderate')}
            >
              <Text style={s.statLabel}>Moderate</Text>
              <Text style={[s.statNum, { color: SEVERITY_CONFIG.moderate.textColor }]}>{moderate}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.bentoCell, s.bentoCellSev, { backgroundColor: filterSev === 'high' ? SEVERITY_CONFIG.high.bgColor : C.surfaceContainerLowest }, filterSev === 'high' && s.bentoCellActive]}
              onPress={() => setFilterSev(filterSev === 'high' ? 'all' : 'high')}
            >
              <Text style={s.statLabel}>High Severity</Text>
              <Text style={[s.statNum, { color: SEVERITY_CONFIG.high.textColor }]}>{high}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.typeFilterSection}>
          <Text style={s.filterTitle}>Filter by Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.typeFilterScroll}>
            <TouchableOpacity style={[s.typePill, filterType === 'all' && s.typePillActive]} onPress={() => setFilterType('all')}>
              <Text style={s.typePillEmoji}>🌐</Text>
              <Text style={[s.typePillText, filterType === 'all' && s.typePillTextActive]}>All Types</Text>
            </TouchableOpacity>
            {Object.keys(MARKER_CONFIG).filter(key => key !== 'other').map((key) => {
              const config = MARKER_CONFIG[key];
              const isActive = filterType === key;
              return (
                <TouchableOpacity key={key} style={[s.typePill, isActive && { backgroundColor: config.color, borderColor: config.color }]} onPress={() => setFilterType(key)}>
                  <Text style={s.typePillEmoji}>{config.emoji}</Text>
                  <Text style={[s.typePillText, isActive && s.typePillTextActive]}>{config.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={{ marginTop: 8 }}>
          <View style={s.feedHeader}>
            <Text style={s.feedTitle}>Bảng tin cảnh báo</Text>
            {!loading && <Text style={s.feedCount}>{filteredData.length} matches</Text>}
          </View>

          {loading && rawMarkers.length === 0 && (
            <View style={s.loadingWrap}>
              <ActivityIndicator color={C.secondary} size="large" />
              <Text style={s.loadingTxt}>Đang tải…</Text>
            </View>
          )}

          {displayed.map((alert) => (
            <TouchableOpacity key={alert.id} style={[s.alertCard, { borderLeftColor: alert.borderColor }, alert.isPinned && s.alertCardPinned]} onPress={() => router.push({ pathname: '/alert-detail', params: { id: alert.id, markerJson: JSON.stringify(alert.raw) } })}>
              <View style={s.alertTop}>
                <View style={[s.alertIconWrap, { backgroundColor: alert.borderColor + '22' }]}><Text style={s.alertIconText}>{alert.icon}</Text></View>
                <View style={s.alertMeta}>
                  <View style={s.alertBadgeRow}>
                    <View style={[s.badge, { backgroundColor: alert.badge.bg }]}><Text style={[s.badgeText, { color: alert.badge.text }]}>{alert.badge.label}</Text></View>
                    <Text style={s.alertType}>{alert.label}</Text>
                    <TouchableOpacity onPress={() => togglePin(alert.id)} style={s.pinBtn}><Text style={[s.pinIcon, alert.isPinned && s.pinIconActive]}>📌</Text></TouchableOpacity>
                  </View>
                  <Text style={s.alertTitle} numberOfLines={2}>{alert.title}</Text>
                  <View style={s.alertMeta2}>
                    <Text style={s.alertLoc} numberOfLines={1}>📍 {alert.location}</Text>
                    <Text style={[s.alertTime, { color: alert.severity === 'critical' ? C.error : C.onSurfaceVariant }]}>⏱ {alert.time}</Text>
                  </View>
                </View>
              </View>
              <View style={s.viewBtn}><Text style={s.viewBtnText}>View Details ›</Text></View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  scroll: { flex: 1 },
  titleWrap: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  overline: { fontSize: 12, fontWeight: '600', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1 },
  pageTitle: { fontSize: 32, fontWeight: '900', color: C.onSurface, marginTop: 2 },
  vnToggle: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5, borderColor: C.outlineVariant, backgroundColor: C.surfaceContainerLow, minWidth: 100, alignItems: 'center' },
  vnToggleActive: { backgroundColor: '#DA251D', borderColor: '#FFFF00' },
  vnToggleText: { fontSize: 12, fontWeight: '800', color: C.onSurfaceVariant },
  vnToggleTextActive: { color: '#FFFF00' },
  reportBtn: { marginHorizontal: 16, marginTop: 16, marginBottom: 16, backgroundColor: C.secondary, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' },
  reportBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  bento: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 16, gap: 12, marginBottom: 4 },
  bentoCell: { backgroundColor: C.surfaceContainerLowest, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.outlineVariant, minHeight: 110, justifyContent: 'space-between' },
  bentoCellTotal: { width: '100%', paddingHorizontal: 20, paddingVertical: 18, marginBottom: 4 },
  bentoCellSev: { width: '48%' },
  bentoCellActive: { borderColor: C.primary, borderWidth: 2 },
  statLabel: { fontSize: 12, fontWeight: '600', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  statNum: { fontSize: 34, fontWeight: '800', color: C.onSurface, lineHeight: 40 },
  statRow: { flexDirection: 'row', alignItems: 'baseline' },
  typeFilterSection: { backgroundColor: C.surfaceContainerLowest, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.outlineVariant },
  filterTitle: { fontSize: 14, fontWeight: '700', color: C.onSurface, marginHorizontal: 16, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  typeFilterScroll: { paddingHorizontal: 16, gap: 8 },
  typePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.background, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.outlineVariant, gap: 6 },
  typePillActive: { backgroundColor: C.primary, borderColor: C.primary },
  typePillEmoji: { fontSize: 16 },
  typePillText: { fontSize: 13, fontWeight: '600', color: C.onSurfaceVariant },
  typePillTextActive: { color: '#fff', fontWeight: '700' },
  feedHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12, marginTop: 8 },
  feedTitle: { fontSize: 24, fontWeight: '700', color: C.onSurface },
  feedCount: { fontSize: 12, color: C.onSurfaceVariant, fontWeight: '500' },
  loadingWrap: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  loadingTxt: { fontSize: 16, fontWeight: '700', color: C.onSurface },
  alertCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: C.surfaceContainerLowest, borderRadius: 16, borderWidth: 1, borderColor: C.outlineVariant, borderLeftWidth: 4, padding: 16, gap: 12 },
  alertCardPinned: { borderColor: C.primary, borderWidth: 1.5, borderLeftWidth: 6 },
  alertTop: { flexDirection: 'row', gap: 12 },
  alertIconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  alertIconText: { fontSize: 22 },
  alertMeta: { flex: 1, gap: 6 },
  alertBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  alertType: { fontSize: 13, color: C.onSurfaceVariant, fontWeight: '500', flex: 1 },
  pinBtn: { padding: 2 },
  pinIcon: { fontSize: 16, opacity: 0.25 },
  pinIconActive: { opacity: 1 },
  alertTitle: { fontSize: 16, fontWeight: '700', color: C.onSurface, lineHeight: 22 },
  alertMeta2: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginTop: 4 },
  alertLoc: { fontSize: 12, color: C.onSurfaceVariant, flex: 1 },
  alertTime: { fontSize: 12, fontWeight: '500' },
  viewBtn: { borderWidth: 1, borderColor: C.outlineVariant, borderRadius: 12, height: 42, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  viewBtnText: { fontSize: 14, fontWeight: '600', color: C.onSurface },
});