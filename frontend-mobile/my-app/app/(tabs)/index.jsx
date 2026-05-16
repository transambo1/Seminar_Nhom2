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

// Convert unified marker → card display format
function markerToCard(marker) {
  const cfg = MARKER_CONFIG[marker.type] || MARKER_CONFIG.other;
  const sev = SEVERITY_CONFIG[marker.severity] || SEVERITY_CONFIG.low;
  return {
    id: marker.id,
    severity: marker.severity,
    type: cfg.label,
    title: marker.title,
    location: `${marker.source} · ${coordStr(marker.coordinate)}`,
    time: timeAgo(marker.time),
    icon: cfg.emoji,
    borderColor: cfg.color,
    badge: {
      label: sev.label,
      bg: sev.bgColor,
      text: sev.color,
    },
    magnitude: marker.magnitude,
    alertLevel: marker.alertLevel,
    url: marker.url,
  };
}

// Severity sort order
const SEV_ORDER = { critical: 0, high: 1, moderate: 2, low: 3 };

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const [rawMarkers, setRawMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filterSev, setFilterSev] = useState('all'); // 'all' | 'critical' | 'high' | 'moderate'

  // ── Computed stats ──────────────────────────────────────────────────────────
  const total = rawMarkers.length;
  const critical = rawMarkers.filter(m => m.severity === 'critical').length;
  const high = rawMarkers.filter(m => m.severity === 'high').length;
  const moderate = rawMarkers.filter(m => m.severity === 'moderate').length;

  // ── Filter + sort ───────────────────────────────────────────────────────────
  const displayed = rawMarkers
    .filter(m => filterSev === 'all' || m.severity === filterSev)
    .sort((a, b) => (SEV_ORDER[a.severity] ?? 3) - (SEV_ORDER[b.severity] ?? 3))
    .slice(0, 30) // cap at 30 for performance
    .map(markerToCard);

  // ── Fetch ───────────────────────────────────────────────────────────────────
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
    // Auto-refresh every 5 minutes
    const t = setInterval(() => loadData(true), 5 * 60 * 1000);
    return () => clearInterval(t);
  }, [loadData]);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity><Text style={s.menuIcon}>☰</Text></TouchableOpacity>
        <Text style={s.brand}>STORMSHIELD</Text>
        <View style={s.avatarCircle}><Text style={s.avatarTxt}>👤</Text></View>
      </View>

      <ScrollView
        style={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            colors={[C.error]}
            tintColor={C.error}
          />
        }
      >
        {/* Page Title */}
        <View style={s.titleWrap}>
          <Text style={s.overline}>Command Center</Text>
          <Text style={s.pageTitle}>Overview</Text>
        </View>

        {/* Report CTA */}
        <TouchableOpacity
          style={s.reportBtn}
          onPress={() => router.push('/(tabs)/report')}
          activeOpacity={0.85}
        >
          <Text style={s.reportBtnText}>＋  Report Incident</Text>
        </TouchableOpacity>

        {/* Stats Bento – Real data */}
        <View style={s.bento}>
          <TouchableOpacity
            style={[s.bentoCell, { flex: 1 }, filterSev === 'all' && s.bentoCellActive]}
            onPress={() => setFilterSev('all')}
          >
            <Text style={s.statLabel}>Active Alerts</Text>
            {loading ? <ActivityIndicator color={C.primary} size="small" />
              : <Text style={s.statNum}>{total}</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.bentoCell, { flex: 1, backgroundColor: filterSev === 'critical' ? C.errorContainer : C.errorContainer + '88' }, filterSev === 'critical' && s.bentoCellActive]}
            onPress={() => setFilterSev(filterSev === 'critical' ? 'all' : 'critical')}
          >
            <Text style={[s.statLabel, { color: C.onErrorContainer }]}>Critical</Text>
            {loading ? <ActivityIndicator color={C.error} size="small" />
              : (
                <View style={s.statRow}>
                  <Text style={[s.statNum, { color: C.error }]}>{critical}</Text>
                  {critical > 0 && <Text style={{ color: C.error, fontSize: 16, marginLeft: 4 }}>↑</Text>}
                </View>
              )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.bentoCell, { flex: 1 }, filterSev === 'moderate' && s.bentoCellActive]}
            onPress={() => setFilterSev(filterSev === 'moderate' ? 'all' : 'moderate')}
          >
            <Text style={s.statLabel}>Moderate</Text>
            {loading ? <ActivityIndicator color={C.onTertiaryContainer} size="small" />
              : <Text style={[s.statNum, { color: C.onTertiaryContainer }]}>{moderate}</Text>}
          </TouchableOpacity>

          <View style={[s.bentoCell, { flex: 1 }]}>
            <Text style={s.statLabel}>High Severity</Text>
            {loading ? <ActivityIndicator color={C.primary} size="small" />
              : <Text style={[s.statNum, { color: C.primary }]}>{high}</Text>}
          </View>
        </View>

        {/* Active Filter Pill */}
        {filterSev !== 'all' && (
          <View style={s.activeFilterBar}>
            <View style={s.activeFilterPill}>
              <Text style={s.activeFilterTxt}>
                {SEVERITY_CONFIG[filterSev]?.label} only
              </Text>
              <TouchableOpacity onPress={() => setFilterSev('all')} style={s.clearFilterBtn}>
                <Text style={s.clearFilterTxt}>✕ Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Feed Header */}
        <View style={s.feedHeader}>
          <Text style={s.feedTitle}>Active Alerts Feed</Text>
          <View style={s.feedMeta}>
            {!loading && (
              <Text style={s.feedCount}>{displayed.length} showing</Text>
            )}
          </View>
        </View>

        {/* Error */}
        {error && (
          <View style={s.errorBanner}>
            <Text style={s.errorTxt}>⚠️ {error}</Text>
          </View>
        )}

        {/* Loading skeleton */}
        {loading && rawMarkers.length === 0 && (
          <View style={s.loadingWrap}>
            <ActivityIndicator color={C.error} size="large" />
            <Text style={s.loadingTxt}>Fetching live alerts…</Text>
            <Text style={s.loadingSource}>USGS · GDACS · NASA EONET · OWM</Text>
          </View>
        )}

        {/* Alert Cards – Real Data */}
        {displayed.map((alert, idx) => {
          // rawMarkers sorted same way, grab by index
          const rawMarker = rawMarkers
            .filter(m => filterSev === 'all' || m.severity === filterSev)
            .sort((a, b) => (SEV_ORDER[a.severity] ?? 3) - (SEV_ORDER[b.severity] ?? 3))[idx];

          const navigateToDetail = () => {
            if (rawMarker) {
              router.push({
                pathname: '/alert-detail',
                params: { id: alert.id, markerJson: JSON.stringify(rawMarker) },
              });
            } else {
              router.push({ pathname: '/alert-detail', params: { id: alert.id } });
            }
          };

          return (
          <TouchableOpacity
            key={alert.id}
            style={[s.alertCard, { borderLeftColor: alert.borderColor }]}
            onPress={navigateToDetail}
            activeOpacity={0.85}
          >
            <View style={s.alertTop}>
              <View style={[s.alertIconWrap, { backgroundColor: alert.borderColor + '22' }]}>
                <Text style={s.alertIconText}>{alert.icon}</Text>
              </View>
              <View style={s.alertMeta}>
                <View style={s.alertBadgeRow}>
                  <View style={[s.badge, { backgroundColor: alert.badge.bg }]}>
                    <Text style={[s.badgeText, { color: alert.badge.text }]}>
                      {alert.badge.label}
                    </Text>
                  </View>
                  <Text style={s.alertType}>{alert.type}</Text>
                </View>
                <Text style={s.alertTitle} numberOfLines={2}>{alert.title}</Text>
                {alert.magnitude != null && (
                  <Text style={[s.alertMagnitude, { color: alert.borderColor }]}>
                    M{alert.magnitude.toFixed(1)}
                  </Text>
                )}
                <View style={s.alertMeta2}>
                  <Text style={s.alertLoc} numberOfLines={1}>📍 {alert.location}</Text>
                  <Text style={[
                    s.alertTime,
                    { color: alert.severity === 'critical' ? C.error : C.onSurfaceVariant },
                  ]}>
                    ⏱ {alert.time}
                  </Text>
                </View>
              </View>
            </View>
            <View style={s.viewBtn}>
              <Text style={s.viewBtnText}>View Details  ›</Text>
            </View>
          </TouchableOpacity>
          );
        })}

        {/* Empty state */}
        {!loading && displayed.length === 0 && !error && (
          <View style={s.emptyWrap}>
            <Text style={s.emptyEmoji}>✅</Text>
            <Text style={s.emptyTxt}>No active alerts</Text>
            <Text style={s.emptySubtxt}>All clear for the selected filter.</Text>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.surfaceContainerLowest,
    borderBottomWidth: 1, borderBottomColor: C.outlineVariant,
  },
  menuIcon: { fontSize: 22, color: C.onSurface },
  brand: { fontSize: 16, fontWeight: '900', color: C.primary, letterSpacing: 2 },
  avatarCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: C.surfaceVariant, alignItems: 'center', justifyContent: 'center',
  },
  avatarTxt: { fontSize: 18 },
  scroll: { flex: 1 },
  titleWrap: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4 },
  overline: { fontSize: 12, fontWeight: '600', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1 },
  pageTitle: { fontSize: 32, fontWeight: '900', color: C.onSurface, marginTop: 2 },
  reportBtn: {
    marginHorizontal: 16, marginTop: 16, marginBottom: 16,
    backgroundColor: C.secondary, borderRadius: 12, height: 48,
    alignItems: 'center', justifyContent: 'center',
  },
  reportBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Bento
  bento: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 16, gap: 10, marginBottom: 20 },
  bentoCell: {
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: C.outlineVariant,
    minHeight: 90, justifyContent: 'space-between', minWidth: '45%',
  },
  bentoCellActive: {
    borderColor: C.primary, borderWidth: 2,
  },
  statLabel: { fontSize: 11, fontWeight: '600', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5 },
  statNum: { fontSize: 38, fontWeight: '800', color: C.onSurface, lineHeight: 44 },
  statRow: { flexDirection: 'row', alignItems: 'baseline' },

  // Active filter
  activeFilterBar: { paddingHorizontal: 16, marginBottom: 12 },
  activeFilterPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.primaryFixed, borderRadius: 99, paddingHorizontal: 14,
    paddingVertical: 8, alignSelf: 'flex-start',
  },
  activeFilterTxt: { fontSize: 13, fontWeight: '600', color: C.primary },
  clearFilterBtn: {},
  clearFilterTxt: { fontSize: 13, fontWeight: '700', color: C.primary },

  // Feed header
  feedHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, marginBottom: 12,
  },
  feedTitle: { fontSize: 22, fontWeight: '700', color: C.onSurface },
  feedMeta: {},
  feedCount: { fontSize: 12, color: C.onSurfaceVariant, fontWeight: '500' },

  // Error
  errorBanner: {
    marginHorizontal: 16, marginBottom: 12, padding: 14,
    backgroundColor: C.errorContainer, borderRadius: 12,
    borderWidth: 1, borderColor: C.error + '40',
  },
  errorTxt: { fontSize: 13, color: C.onErrorContainer, fontWeight: '600', textAlign: 'center' },

  // Loading
  loadingWrap: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  loadingTxt: { fontSize: 16, fontWeight: '700', color: C.onSurface },
  loadingSource: { fontSize: 12, color: C.outline, letterSpacing: 0.5 },

  // Alert Card
  alertCard: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 16, borderWidth: 1,
    borderColor: C.outlineVariant, borderLeftWidth: 4,
    padding: 14, gap: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  alertTop: { flexDirection: 'row', gap: 12 },
  alertIconWrap: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  alertIconText: { fontSize: 22 },
  alertMeta: { flex: 1, gap: 4 },
  alertBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  alertType: { fontSize: 12, color: C.onSurfaceVariant, fontWeight: '500' },
  alertTitle: { fontSize: 15, fontWeight: '700', color: C.onSurface, lineHeight: 21 },
  alertMagnitude: { fontSize: 13, fontWeight: '700' },
  alertMeta2: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  alertLoc: { fontSize: 12, color: C.onSurfaceVariant, flex: 1 },
  alertTime: { fontSize: 12, fontWeight: '500' },
  viewBtn: {
    borderWidth: 1, borderColor: C.outlineVariant,
    borderRadius: 10, height: 38,
    alignItems: 'center', justifyContent: 'center',
  },
  viewBtnText: { fontSize: 13, fontWeight: '600', color: C.onSurface },

  // Empty state
  emptyWrap: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTxt: { fontSize: 18, fontWeight: '700', color: C.onSurface },
  emptySubtxt: { fontSize: 14, color: C.onSurfaceVariant },
});
