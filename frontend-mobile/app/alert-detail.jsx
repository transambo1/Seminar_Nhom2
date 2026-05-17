import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Linking
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { C } from '../src/constants/colors';
import { MARKER_CONFIG, SEVERITY_CONFIG } from '../src/constants/markerConfig';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(iso) {
  if (!iso) return 'Unknown time';
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return `${Math.floor(d)}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

function coordLabel(lat, lon) {
  if (lat == null || lon == null) return 'Unknown location';
  return `${Math.abs(lat).toFixed(3)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(3)}°${lon >= 0 ? 'E' : 'W'}`;
}

// Source URL labels
const SOURCE_FULL = {
  USGS: 'USGS Earthquake Hazards Program',
  GDACS: 'GDACS – Global Disaster Alert',
  NASA_EONET: 'NASA Earth Observatory',
  OWM: 'OpenWeatherMap',
};

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function AlertDetailScreen() {
  // Params can carry real API data (serialized as JSON strings)
  const params = useLocalSearchParams();

  // If a real marker is passed via JSON param, use it; else fall back to demo
  let marker = null;
  try {
    if (params.markerJson) marker = JSON.parse(params.markerJson);
  } catch (_) { }

  // Derive display values from real marker OR demo data
  const type = marker?.type || 'flood';
  const severity = marker?.severity || 'critical';
  const cfg = MARKER_CONFIG[type] || MARKER_CONFIG.other;
  const sev = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.critical;

  const title = marker?.title || 'Immediate Evacuation Ordered for Lower Valley Districts';
  const description = marker?.description || 'A life-threatening event is in progress. Move to safety immediately and follow local authority instructions.';
  const issuedAt = marker?.time ? timeAgo(marker.time) : '–';
  const fullTime = marker?.time ? new Date(marker.time).toLocaleString() : '–';
  const lat = marker?.coordinate?.latitude;
  const lon = marker?.coordinate?.longitude;
  const source = marker?.source || 'USGS';
  const magnitude = marker?.magnitude;
  const alertLevel = marker?.alertLevel;
  const url = marker?.url;

  const stats = [
    { icon: '⏱️', label: 'Issued', value: issuedAt },
    { icon: '📡', label: 'Source', value: SOURCE_FULL[source] || source },
    ...(magnitude != null ? [{ icon: '📊', label: 'Magnitude', value: `M${magnitude.toFixed(1)}` }] : []),
    ...(alertLevel ? [{ icon: '🚦', label: 'Alert Level', value: alertLevel }] : []),
    { icon: '📍', label: 'Coordinates', value: marker?.provinceName || marker?.placeName || coordLabel(lat, lon) },
    { icon: '🕐', label: 'Full Timestamp', value: fullTime },
  ];

  const actions = [
    { icon: '🚗', text: 'Move away from the affected area following official evacuation routes.' },
    { icon: '📱', text: 'Stay informed via official emergency broadcasts and local authorities.' },
    { icon: '🏥', text: 'Bring essential items: medications, ID documents, and emergency supplies.' },
  ];

  const timeline = [
    { time: 'Latest update', title: `${cfg.label} – ${sev.label} Level`, desc: description, active: true },
    { time: issuedAt, title: 'Alert Issued', desc: `Event detected by ${SOURCE_FULL[source] || source}.`, active: false },
  ];

  return (
    <SafeAreaView style={s.root}>
      {/* Top Bar */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.topTitle}>Alert Details</Text>
        <View style={s.topActions}>
          {url && (
            <TouchableOpacity style={s.iconBtn} onPress={() => Linking.openURL(url)}>
              <Text>🔗</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.iconBtn}><Text>🔖</Text></TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.scroll}>
        {/* Hero */}
        <View style={[s.hero, { backgroundColor: cfg.color + '33' }]}>
          <Text style={s.heroEmoji}>{cfg.emoji}</Text>
        </View>

        <View style={s.content}>
          {/* Primary Alert Card */}
          <View style={[s.alertCard, { borderLeftColor: cfg.color, borderLeftWidth: 5 }]}>
            <View style={s.cardTop}>
              <View style={[s.criticalBadge, { backgroundColor: sev.color }]}>
                <Text style={s.criticalTxt}>⚠️  {sev.label} WARNING</Text>
              </View>
              <View style={[s.sourcePill, { backgroundColor: cfg.bgColor }]}>
                <Text style={[s.sourcePillTxt, { color: cfg.color }]}>{source}</Text>
              </View>
            </View>

            <Text style={s.alertTitle}>{title}</Text>

            {/* 🟢 HIỂN THỊ HÌNH ẢNH (Nếu có từ báo cáo dân sự)
            {marker?.url && (
              <View style={s.imageDetailWrapper}>
                <Image
                  source={{ uri: marker.url }}
                  style={s.detailImage}
                  resizeMode="cover"
                />
              </View>
            )} */}

            {magnitude != null && (
              <Text style={[s.magnitudeLine, { color: sev.color }]}>
                Magnitude M{magnitude.toFixed(1)} · {cfg.label}
              </Text>
            )}

            <Text style={s.alertDesc}>{description}</Text>
          </View>
          {/* Stats Bento */}
          <View style={s.bento}>
            {stats.map((st, i) => (
              <View key={i} style={s.bentoCell}>
                <Text style={s.bentoIcon}>{st.icon}</Text>
                <Text style={s.bentoLabel}>{st.label}</Text>
                <Text style={s.bentoVal} numberOfLines={2}>{st.value}</Text>
              </View>
            ))}
          </View>

          {/* Required Actions */}
          <View style={[s.actionsCard, { backgroundColor: sev.bgColor }]}>
            <Text style={s.actionsTitle}>  Required Actions</Text>
            {actions.map((a, i) => (
              <View key={i} style={s.actionItem}>
                <Text style={s.actionIcon}>{a.icon}</Text>
                <Text style={s.actionText}>{a.text}</Text>
              </View>
            ))}
          </View>

          {/* Timeline */}
          <View style={s.timelineCard}>
            <Text style={s.sectionTitle}>Event Timeline</Text>
            <View style={s.timeline}>
              {timeline.map((t, i) => (
                <View key={i} style={s.timelineItem}>
                  <View style={s.timelineLine}>
                    <View style={[s.timelineDot, t.active && { backgroundColor: cfg.color }]} />
                    {i < timeline.length - 1 && <View style={s.timelineConnector} />}
                  </View>
                  <View style={s.timelineContent}>
                    <Text style={[s.timelineTime, t.active && { color: cfg.color }]}>{t.time}</Text>
                    <Text style={s.timelineTitle}>{t.title}</Text>
                    <Text style={s.timelineDesc}>{t.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* External Source Link */}
          {url && (
            <TouchableOpacity style={s.srcBtn} onPress={() => Linking.openURL(url)}>
              <Text style={s.srcBtnTxt}>📡  View on {SOURCE_FULL[source] || source}  →</Text>
            </TouchableOpacity>
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
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8, paddingVertical: 8,
    backgroundColor: C.surfaceContainerLowest,
    borderBottomWidth: 1, borderBottomColor: C.outlineVariant,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  backIcon: { fontSize: 22, color: C.onSurface },
  topTitle: { fontSize: 14, fontWeight: '700', color: C.onSurface, textTransform: 'uppercase', letterSpacing: 1 },
  topActions: { flexDirection: 'row', gap: 4 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  scroll: { flex: 1 },
  hero: { height: 180, alignItems: 'center', justifyContent: 'center' },
  heroEmoji: { fontSize: 80, opacity: 0.75 },
  content: { padding: 16, gap: 14 },
  alertCard: {
    backgroundColor: C.surfaceContainerLowest, borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: C.outlineVariant,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 },
  criticalBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  criticalTxt: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  sourcePill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  sourcePillTxt: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  alertTitle: { fontSize: 22, fontWeight: '800', color: C.onSurface, lineHeight: 28, marginBottom: 8 },
  magnitudeLine: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  alertDesc: { fontSize: 15, color: C.onSurfaceVariant, lineHeight: 22 },
  bento: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bentoCell: {
    width: '47%', backgroundColor: C.surfaceContainerLowest,
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.outlineVariant, gap: 4,
  },
  bentoIcon: { fontSize: 20 },
  bentoLabel: { fontSize: 10, fontWeight: '600', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  bentoVal: { fontSize: 14, fontWeight: '800', color: C.onSurface, lineHeight: 18 },
  actionsCard: { borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#00000010', gap: 12 },
  actionsTitle: { fontSize: 17, fontWeight: '700', color: C.onSurface },
  actionItem: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  actionIcon: { fontSize: 18, marginTop: 2 },
  actionText: { flex: 1, fontSize: 14, color: C.onSurface, lineHeight: 20 },
  timelineCard: {
    backgroundColor: C.surfaceContainerLowest, borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: C.outlineVariant,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: C.onSurface, marginBottom: 16 },
  timeline: { gap: 0 },
  timelineItem: { flexDirection: 'row', gap: 14, minHeight: 80 },
  timelineLine: { alignItems: 'center', width: 20 },
  timelineDot: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: C.surfaceContainerHighest,
    borderWidth: 3, borderColor: C.surfaceContainerLowest, marginTop: 2,
  },
  timelineConnector: { flex: 1, width: 2, backgroundColor: C.surfaceContainerHighest, marginVertical: 2 },
  timelineContent: { flex: 1, paddingBottom: 16 },
  timelineTime: { fontSize: 12, fontWeight: '600', color: C.onSurfaceVariant, marginBottom: 4 },
  timelineTitle: { fontSize: 14, fontWeight: '700', color: C.onSurface, marginBottom: 4 },
  timelineDesc: { fontSize: 13, color: C.onSurfaceVariant, lineHeight: 18 },
  srcBtn: {
    height: 50, borderWidth: 1.5, borderColor: C.outlineVariant,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  srcBtnTxt: { fontSize: 14, fontWeight: '600', color: C.primary },
  // Thêm vào s = StyleSheet.create({ ... })
  imageDetailWrapper: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: C.surfaceContainerHigh,
  },
  detailImage: {
    width: '100%',
    height: '100%',
  },
});
