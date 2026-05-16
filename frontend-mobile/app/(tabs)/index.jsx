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

// Thêm prop isPinned vào card để UI biết đường vẽ icon ghim
function markerToCard(marker, pinnedIds = []) {
  const cfg = MARKER_CONFIG[marker.type] || MARKER_CONFIG.other;
  const sev = SEVERITY_CONFIG[marker.severity] || SEVERITY_CONFIG.low;
  const isPinned = pinnedIds.includes(marker.id);
  
  return {
    id: marker.id,
    severity: marker.severity,
    type: marker.type,
    label: cfg.label,
    title: marker.title,
    location: `${marker.source} · ${coordStr(marker.coordinate)}`,
    time: timeAgo(marker.time),
    timeRaw: new Date(marker.time).getTime(), // Giữ time timestamp để sort cho chuẩn
    icon: cfg.emoji,
    borderColor: cfg.color,
    badge: {
      label: sev.label,
      bg: sev.bgColor,
      text: sev.textColor || sev.color,
    },
    magnitude: marker.magnitude,
    alertLevel: marker.alertLevel,
    url: marker.url,
    isPinned, // 🟢 Trạng thái ghim của thẻ
    raw: marker, // 🟢 Găm sẵn cục dữ liệu gốc ban đầu vào đây
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
  const [pinnedIds, setPinnedIds] = useState([]); // 🟢 State lưu mảng các ID được ghim

  // ── Computed stats ──────────────────────────────────────────────────────────
  const total = rawMarkers.length;
  const critical = rawMarkers.filter(m => m.severity === 'critical').length;
  const high = rawMarkers.filter(m => m.severity === 'high').length;
  const moderate = rawMarkers.filter(m => m.severity === 'moderate').length;

  // ── Filter + Sort Logic (Cải tiến theo ý tưởng mới của bạn) ─────────────────
  const filteredData = rawMarkers
    .filter(m => filterSev === 'all' || m.severity === filterSev)
    .filter(m => filterType === 'all' || m.type === filterType);

  const displayed = filteredData
    .map(m => markerToCard(m, pinnedIds))
    .sort((a, b) => {
      // 1. Ưu tiên hàng đầu: Thẻ được Ghim (isPinned = true lên trước)
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;

      // 2. Ưu tiên hàng hai: Thẻ có mức độ Critical (severity = 'critical' lên trước)
      const aIsCritical = a.severity === 'critical';
      const bIsCritical = b.severity === 'critical';
      if (aIsCritical !== bIsCritical) return aIsCritical ? -1 : 1;

      // 3. Ưu tiên hàng ba: Xếp theo thời gian mới nhất (Thời gian giảm dần)
      return b.timeRaw - a.timeRaw;
    })
    .slice(0, 30); // Cap 30 phần tử để tối ưu mượt mà

  // ── Toggle Pin Function ──────────────────────────────────────────────────────
  const togglePin = useCallback((id) => {
    setPinnedIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  }, []);

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
    const t = setInterval(() => loadData(true), 5 * 60 * 1000);
    return () => clearInterval(t);
  }, [loadData]);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.root}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ backgroundColor: C.background }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            colors={[C.error]}
            tintColor={C.error}
          />
        }
      >
        {/* Khối phía trên: Header + Bento */}
        <View style={{ backgroundColor: C.surfaceContainerLowest, paddingBottom: 16 }}>
          <View style={s.titleWrap}>
            <Text style={s.overline}>Command Center</Text>
            <Text style={s.pageTitle}>Overview</Text>
          </View>

          <TouchableOpacity
            style={s.reportBtn}
            onPress={() => router.push('/(tabs)/report')}
            activeOpacity={0.85}
          >
            <Text style={s.reportBtnText}>＋  Report Incident</Text>
          </TouchableOpacity>

          {/* Stats Bento */}
          <View style={s.bento}>
            <TouchableOpacity
              style={[s.bentoCell, s.bentoCellTotal, filterSev === 'all' && s.bentoCellActive]}
              onPress={() => setFilterSev('all')}
            >
              <Text style={s.statLabel}>Active Alerts</Text>
              {loading ? <ActivityIndicator color={C.primary} size="small" />
                : <Text style={s.statNum}>{total}</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.bentoCell, s.bentoCellSev, { backgroundColor: filterSev === 'critical' ? SEVERITY_CONFIG.critical.bgColor : SEVERITY_CONFIG.critical.bgColor + '88' }, filterSev === 'critical' && s.bentoCellActive]}
              onPress={() => setFilterSev(filterSev === 'critical' ? 'all' : 'critical')}
            >
              <Text style={[s.statLabel, { color: SEVERITY_CONFIG.critical.textColor }]}>Critical</Text>
              {loading ? <ActivityIndicator color={SEVERITY_CONFIG.critical.color} size="small" />
                : (
                  <View style={s.statRow}>
                    <Text style={[s.statNum, { color: SEVERITY_CONFIG.critical.color }]}>{critical}</Text>
                    {critical > 0 && <Text style={{ color: SEVERITY_CONFIG.critical.color, fontSize: 16, marginLeft: 4 }}>↑</Text>}
                  </View>
                )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.bentoCell, s.bentoCellSev, { backgroundColor: filterSev === 'moderate' ? SEVERITY_CONFIG.moderate.bgColor : C.surfaceContainerLowest }, filterSev === 'moderate' && s.bentoCellActive]}
              onPress={() => setFilterSev(filterSev === 'moderate' ? 'all' : 'moderate')}
            >
              <Text style={s.statLabel}>Moderate</Text>
              {loading ? <ActivityIndicator color={SEVERITY_CONFIG.moderate.color} size="small" />
                : <Text style={[s.statNum, { color: SEVERITY_CONFIG.moderate.textColor }]}>{moderate}</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.bentoCell, s.bentoCellSev, { backgroundColor: filterSev === 'high' ? SEVERITY_CONFIG.high.bgColor : C.surfaceContainerLowest }, filterSev === 'high' && s.bentoCellActive]}
              onPress={() => setFilterSev(filterSev === 'high' ? 'all' : 'high')}
            >
              <Text style={s.statLabel}>High Severity</Text>
              {loading ? <ActivityIndicator color={C.primary} size="small" />
                : <Text style={[s.statNum, { color: SEVERITY_CONFIG.high.textColor }]}>{high}</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Khối bộ lọc Thể loại */}
        <View style={s.typeFilterSection}>
          <Text style={s.filterTitle}>Filter by Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.typeFilterScroll}>
            <TouchableOpacity
              style={[s.typePill, filterType === 'all' && s.typePillActive]}
              onPress={() => setFilterType('all')}
              activeOpacity={0.7}
            >
              <Text style={s.typePillEmoji}>🌐</Text>
              <Text style={[s.typePillText, filterType === 'all' && s.typePillTextActive]}>All Types</Text>
            </TouchableOpacity>

            {Object.keys(MARKER_CONFIG)
              .filter(key => key !== 'other')
              .map((key) => {
                const config = MARKER_CONFIG[key];
                const isActive = filterType === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[s.typePill, isActive && { backgroundColor: config.color, borderColor: config.color }]}
                    onPress={() => setFilterType(key)}
                    activeOpacity={0.7}
                  >
                    <Text style={s.typePillEmoji}>{config.emoji}</Text>
                    <Text style={[s.typePillText, isActive && s.typePillTextActive]}>{config.label}</Text>
                  </TouchableOpacity>
                );
              })}
          </ScrollView>
        </View>

        {/* Khối phía dưới: Active Alerts Feed */}
        <View style={{ marginTop: 8 }}>
          {/* Active Filter Pills Bar */}
          {(filterSev !== 'all' || filterType !== 'all') && (
            <View style={s.activeFilterBar}>
              <View style={s.filterPillGroup}>
                {filterSev !== 'all' && (
                  <View style={[s.activeFilterPill, { backgroundColor: SEVERITY_CONFIG[filterSev]?.bgColor }]}>
                    <Text style={[s.activeFilterTxt, { color: SEVERITY_CONFIG[filterSev]?.textColor }]}>{SEVERITY_CONFIG[filterSev]?.label}</Text>
                    <TouchableOpacity onPress={() => setFilterSev('all')}>
                      <Text style={[s.clearPillX, { color: SEVERITY_CONFIG[filterSev]?.textColor }]}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {filterType !== 'all' && (
                  <View style={[s.activeFilterPill, { backgroundColor: MARKER_CONFIG[filterType]?.bgColor || C.outlineVariant }]}>
                    <Text style={[s.activeFilterTxt, { color: MARKER_CONFIG[filterType]?.color || C.primary }]}>{MARKER_CONFIG[filterType]?.label}</Text>
                    <TouchableOpacity onPress={() => setFilterType('all')}>
                      <Text style={[s.clearPillX, { color: MARKER_CONFIG[filterType]?.color || C.primary }]}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <TouchableOpacity onPress={() => { setFilterSev('all'); setFilterType('all'); }} style={s.clearAllBtn}>
                  <Text style={s.clearAllTxt}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Feed Header */}
          <View style={s.feedHeader}>
            <Text style={s.feedTitle}>Active Alerts Feed</Text>
            <View style={s.feedMeta}>
              {!loading && <Text style={s.feedCount}>{filteredData.length} matches</Text>}
            </View>
          </View>

          {/* Error Banner */}
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

          {/* Alert Cards – Render Sạch Gọn */}
          {displayed.map((alert) => {
            const navigateToDetail = () => {
              router.push({
                pathname: '/alert-detail',
                params: { id: alert.id, markerJson: JSON.stringify(alert.raw) }, // 🟢 Truyền trực tiếp từ alert.raw cực sạch
              });
            };

            return (
              <TouchableOpacity
                key={alert.id}
                style={[s.alertCard, { borderLeftColor: alert.borderColor }, alert.isPinned && s.alertCardPinned]}
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
                        <Text style={[s.badgeText, { color: alert.badge.text }]}>{alert.badge.label}</Text>
                      </View>
                      <Text style={s.alertType}>{alert.label}</Text>

                      {/* NÚT GHIM (PIN) - Thiết kế nằm gọn bên góc badge */}
                      <TouchableOpacity 
                        onPress={() => togglePin(alert.id)}
                        style={s.pinBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Text style={[s.pinIcon, alert.isPinned && s.pinIconActive]}>
                          {alert.isPinned ? '📌' : '📌'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={s.alertTitle} numberOfLines={2}>{alert.title}</Text>
                    
                    {alert.magnitude != null && (
                      <Text style={[s.alertMagnitude, { color: alert.borderColor }]}>M{alert.magnitude.toFixed(1)}</Text>
                    )}

                    <View style={s.alertMeta2}>
                      <Text style={s.alertLoc} numberOfLines={1}>📍 {alert.location}</Text>
                      <Text style={[s.alertTime, { color: alert.severity === 'critical' ? SEVERITY_CONFIG.critical.color : C.onSurfaceVariant }]}>
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
              <Text style={s.emptyEmoji}>🍃</Text>
              <Text style={s.emptyTxt}>No matching alerts</Text>
              <Text style={s.emptySubtxt}>Try adjusting your filters or search criteria.</Text>
            </View>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  scroll: { flex: 1 },
  titleWrap: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4 },
  overline: { fontSize: 12, fontWeight: '600', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1 },
  pageTitle: { fontSize: 32, fontWeight: '900', color: C.onSurface, marginTop: 2 },
  reportBtn: { marginHorizontal: 16, marginTop: 16, marginBottom: 16, backgroundColor: C.secondary, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' },
  reportBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Bento
  bento: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 16, gap: 12, marginBottom: 4 },
  bentoCell: { backgroundColor: C.surfaceContainerLowest, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.outlineVariant, minHeight: 110, justifyContent: 'space-between' },
  bentoCellTotal: { width: '100%', paddingHorizontal: 20, paddingVertical: 18, marginBottom: 4 },
  bentoCellSev: { width: '48%' },
  bentoCellActive: { borderColor: C.primary, borderWidth: 2 },
  statLabel: { fontSize: 12, fontWeight: '600', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  statNum: { fontSize: 34, fontWeight: '800', color: C.onSurface, lineHeight: 40 },
  statRow: { flexDirection: 'row', alignItems: 'baseline' },

  // Category Filter Style
  typeFilterSection: { backgroundColor: C.surfaceContainerLowest, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.outlineVariant },
  filterTitle: { fontSize: 14, fontWeight: '700', color: C.onSurface, marginHorizontal: 16, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  typeFilterScroll: { paddingHorizontal: 16, gap: 8 },
  typePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.background, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.outlineVariant, gap: 6 },
  typePillActive: { backgroundColor: C.primary, borderColor: C.primary },
  typePillEmoji: { fontSize: 16 },
  typePillText: { fontSize: 13, fontWeight: '600', color: C.onSurfaceVariant },
  typePillTextActive: { color: '#fff', fontWeight: '700' },

  // Active filter pills bar
  activeFilterBar: { paddingHorizontal: 16, marginBottom: 16, marginTop: 8 },
  filterPillGroup: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  activeFilterPill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  activeFilterTxt: { fontSize: 12, fontWeight: '700' },
  clearPillX: { fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  clearAllBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  clearAllTxt: { fontSize: 13, fontWeight: '700', color: C.error },

  // Feed header
  feedHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12, marginTop: 8 },
  feedTitle: { fontSize: 24, fontWeight: '700', color: C.onSurface },
  feedMeta: {},
  feedCount: { fontSize: 12, color: C.onSurfaceVariant, fontWeight: '500' },

  // Error Banner
  errorBanner: { marginHorizontal: 16, marginBottom: 12, padding: 14, backgroundColor: C.errorContainer, borderRadius: 12, borderWidth: 1, borderColor: C.error + '40' },
  errorTxt: { fontSize: 13, color: C.onErrorContainer, fontWeight: '600', textAlign: 'center' },

  // Loading Wrap
  loadingWrap: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  loadingTxt: { fontSize: 16, fontWeight: '700', color: C.onSurface },
  loadingSource: { fontSize: 12, color: C.outline || C.onSurfaceVariant, letterSpacing: 0.5 },

  // Alert Card
  alertCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: C.surfaceContainerLowest, borderRadius: 16, borderWidth: 1, borderColor: C.outlineVariant, borderLeftWidth: 4, padding: 16, gap: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  alertCardPinned: { borderColor: C.primary, borderWidth: 1.5, borderLeftWidth: 6 }, // Style nổi bật khi được ghim
  alertTop: { flexDirection: 'row', gap: 12 },
  alertIconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  alertIconText: { fontSize: 22 },
  alertMeta: { flex: 1, gap: 6 },
  alertBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap', position: 'relative' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  alertType: { fontSize: 13, color: C.onSurfaceVariant, fontWeight: '500', flex: 1 },
  
  // Pin Styles
  pinBtn: { padding: 2, marginRight: 4 },
  pinIcon: { fontSize: 16, opacity: 0.25 }, // Mờ khi chưa ghim
  pinIconActive: { opacity: 1, scale: 1.1 }, // Rõ nét khi đã ghim

  alertTitle: { fontSize: 16, fontWeight: '700', color: C.onSurface, lineHeight: 22 },
  alertMagnitude: { fontSize: 14, fontWeight: '700' },
  alertMeta2: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginTop: 4 },
  alertLoc: { fontSize: 12, color: C.onSurfaceVariant, flex: 1 },
  alertTime: { fontSize: 12, fontWeight: '500' },
  viewBtn: { borderWidth: 1, borderColor: C.outlineVariant, borderRadius: 12, height: 42, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  viewBtnText: { fontSize: 14, fontWeight: '600', color: C.onSurface },

  // Empty state Wrap
  emptyWrap: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTxt: { fontSize: 18, fontWeight: '700', color: C.onSurface },
  emptySubtxt: { fontSize: 14, color: C.onSurfaceVariant },
});