import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { C } from '../src/constants/colors';

const SHELTER_DATA = {
  s1: {
    name: 'Central High School', address: '1200 West Elm Street',
    type: 'PRIMARY SHELTER', occupied: 78,
    amenities: ['🏥 Medical', '🐾 Pets', '📶 WiFi', '🔋 Backup Power'],
    time: '12 min', distance: '4.2 miles via Main St.',
    warning: 'Avoid Route 9',
    coordinator: { name: 'Sarah Miller', role: 'FEMA Site Lead', initials: 'SM' },
    steps: [
      { icon: '↑', text: 'Head north on Oak Ave toward 4th St', dist: '0.2 mi', warning: null },
      { icon: '↰', text: 'Turn left onto W Main St', dist: '3.5 mi', warning: '⚠️ Debris reported in left lane' },
      { icon: '↱', text: 'Turn right onto Elm St. Destination will be on the left.', dist: '0.5 mi', warning: null },
    ],
  },
};

export default function ShelterNavigationScreen() {
  const { id } = useLocalSearchParams();
  const shelter = SHELTER_DATA[id] || SHELTER_DATA['s1'];

  return (
    <SafeAreaView style={s.root}>
      {/* Top Bar */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.brand}>STORMSHIELD</Text>
        <TouchableOpacity style={s.avatarBtn}><Text style={s.avatarTxt}>👤</Text></TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Mini Map Placeholder */}
        <View style={s.mapSection}>
          <View style={s.mapBg}>
            <Text style={s.mapEmoji}>🗺️</Text>
            <Text style={s.mapRouteEmoji}>📍</Text>
          </View>
        </View>

        {/* ETA Bar */}
        <View style={s.etaBar}>
          <View>
            <Text style={s.etaTime}>{shelter.time}</Text>
            <Text style={s.etaDist}>{shelter.distance}</Text>
          </View>
          <TouchableOpacity style={s.avoidBtn}>
            <Text style={s.avoidTxt}>{shelter.warning}</Text>
          </TouchableOpacity>
        </View>

        {/* Shelter Info Card */}
        <View style={s.infoCard}>
          <View style={s.infoTop}>
            <View style={{ flex: 1 }}>
              <View style={s.typeBadge}><Text style={s.typeBadgeTxt}>◆ {shelter.type}</Text></View>
              <Text style={s.shelterName}>{shelter.name}</Text>
              <Text style={s.shelterAddr}>📍 {shelter.address}</Text>
            </View>
            {/* Occupancy Donut */}
            <View style={s.donut}>
              <Text style={s.donutPct}>{shelter.occupied}%</Text>
              <Text style={s.donutLabel}>Occupied</Text>
            </View>
          </View>

          <Text style={s.amenitiesLabel}>AVAILABLE AMENITIES</Text>
          <View style={s.amenitiesRow}>
            {shelter.amenities.map((a, i) => (
              <View key={i} style={s.amenityChip}>
                <Text style={s.amenityTxt}>{a}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Route Instructions */}
        <View style={s.routeCard}>
          <Text style={s.sectionTitle}>Route Instructions</Text>
          {shelter.steps.map((step, i) => (
            <View key={i} style={s.stepRow}>
              <View style={s.stepIcon}><Text style={s.stepIconTxt}>{step.icon}</Text></View>
              <View style={s.stepBody}>
                <Text style={s.stepText}>{step.text}</Text>
                {step.warning && (
                  <View style={s.stepWarning}>
                    <Text style={s.stepWarningTxt}>{step.warning}</Text>
                  </View>
                )}
                <Text style={s.stepDist}>{step.dist}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={s.actions}>
          <TouchableOpacity style={s.navBtn} activeOpacity={0.85}>
            <Text style={s.navBtnTxt}>▲  Start Navigation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.outlineBtn}>
            <Text style={s.outlineBtnTxt}>📞  Call Shelter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.outlineBtn}>
            <Text style={s.outlineBtnTxt}>🔗  Share Location</Text>
          </TouchableOpacity>
        </View>

        {/* Coordinator */}
        <View style={s.coordinatorCard}>
          <Text style={s.coordinatorLabel}>COORDINATOR</Text>
          <View style={s.coordinatorRow}>
            <View style={s.coordAvatar}>
              <Text style={s.coordInitials}>{shelter.coordinator.initials}</Text>
            </View>
            <View>
              <Text style={s.coordName}>{shelter.coordinator.name}</Text>
              <Text style={s.coordRole}>{shelter.coordinator.role}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.surfaceContainerLowest,
    borderBottomWidth: 1, borderBottomColor: C.outlineVariant,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 22 },
  brand: { fontSize: 15, fontWeight: '900', color: C.primary, letterSpacing: 2 },
  avatarBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontSize: 18 },
  scroll: { flex: 1 },
  mapSection: { height: 200, backgroundColor: '#d1e8d1', overflow: 'hidden' },
  mapBg: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mapEmoji: { fontSize: 80, opacity: 0.4 },
  mapRouteEmoji: { position: 'absolute', top: '20%', fontSize: 32 },
  etaBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.surfaceContainerLowest, paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.outlineVariant,
  },
  etaTime: { fontSize: 28, fontWeight: '900', color: C.onSurface },
  etaDist: { fontSize: 13, color: C.onSurfaceVariant, marginTop: 2 },
  avoidBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    backgroundColor: C.primaryFixed,
  },
  avoidTxt: { fontSize: 13, fontWeight: '700', color: C.primary },
  infoCard: {
    margin: 16, backgroundColor: C.surfaceContainerLowest,
    borderRadius: 16, padding: 18, borderWidth: 1, borderColor: C.outlineVariant,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  infoTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  typeBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, backgroundColor: C.surfaceContainer,
    marginBottom: 8,
  },
  typeBadgeTxt: { fontSize: 11, fontWeight: '700', color: C.onSurface },
  shelterName: { fontSize: 24, fontWeight: '800', color: C.onSurface, lineHeight: 28 },
  shelterAddr: { fontSize: 13, color: C.onSurfaceVariant, marginTop: 4 },
  donut: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 6, borderColor: C.tertiaryFixedDim,
    alignItems: 'center', justifyContent: 'center', marginLeft: 12,
  },
  donutPct: { fontSize: 16, fontWeight: '800', color: C.onSurface },
  donutLabel: { fontSize: 9, color: C.onSurfaceVariant, fontWeight: '600' },
  amenitiesLabel: { fontSize: 11, fontWeight: '700', color: C.onSurfaceVariant, letterSpacing: 1, marginBottom: 8 },
  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8,
    borderWidth: 1, borderColor: C.outlineVariant, backgroundColor: C.surface,
  },
  amenityTxt: { fontSize: 13, fontWeight: '600', color: C.onSurface },
  routeCard: {
    marginHorizontal: 16, backgroundColor: C.surfaceContainerLowest,
    borderRadius: 16, padding: 18, borderWidth: 1, borderColor: C.outlineVariant, gap: 14,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: C.onSurface },
  stepRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
  },
  stepIconTxt: { fontSize: 18, color: '#fff', fontWeight: '700' },
  stepBody: { flex: 1, gap: 4 },
  stepText: { fontSize: 14, fontWeight: '600', color: C.onSurface, lineHeight: 20 },
  stepWarning: {
    backgroundColor: C.errorContainer, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  stepWarningTxt: { fontSize: 12, color: C.onErrorContainer, fontWeight: '600' },
  stepDist: { fontSize: 12, color: C.onSurfaceVariant },
  actions: { marginHorizontal: 16, marginTop: 16, gap: 10 },
  navBtn: {
    height: 54, backgroundColor: C.primary, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.primary, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6,
  },
  navBtnTxt: { color: '#fff', fontSize: 17, fontWeight: '800' },
  outlineBtn: {
    height: 48, borderRadius: 12, borderWidth: 1.5,
    borderColor: C.outlineVariant, alignItems: 'center', justifyContent: 'center',
  },
  outlineBtnTxt: { fontSize: 14, fontWeight: '600', color: C.onSurface },
  coordinatorCard: {
    marginHorizontal: 16, marginTop: 14,
    backgroundColor: C.surfaceContainer, borderRadius: 14, padding: 16, gap: 10,
  },
  coordinatorLabel: { fontSize: 11, fontWeight: '700', color: C.onSurfaceVariant, letterSpacing: 1 },
  coordinatorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  coordAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.secondary, alignItems: 'center', justifyContent: 'center',
  },
  coordInitials: { color: '#fff', fontSize: 16, fontWeight: '800' },
  coordName: { fontSize: 15, fontWeight: '700', color: C.onSurface },
  coordRole: { fontSize: 12, color: C.onSurfaceVariant },
});
