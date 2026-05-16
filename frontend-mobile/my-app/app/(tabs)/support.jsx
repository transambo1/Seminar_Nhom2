import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, SafeAreaView, Alert,
} from 'react-native';
import { C } from '../../src/constants/colors';

const SUPPORT_TYPES = [
  { id: 'medical', label: 'Medical', emoji: '🏥' },
  { id: 'food', label: 'Food / Water', emoji: '💧' },
  { id: 'rescue', label: 'Rescue', emoji: '🚁' },
];
const PRIORITIES = ['Critical', 'High', 'Normal'];

export default function SupportScreen() {
  const [supportType, setSupportType] = useState(null);
  const [priority, setPriority] = useState('Critical');
  const [location, setLocation] = useState('34.0522° N, 118.2437° W');
  const [description, setDescription] = useState('');

  const submit = () => {
    if (!supportType) {
      Alert.alert('Missing Info', 'Please select a type of support.');
      return;
    }
    Alert.alert('🆘 Request Submitted', 'Emergency services have been notified. Stay calm and remain visible.', [{ text: 'OK' }]);
  };

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Text style={s.brand}>STORMSHIELD</Text>
      </View>
      <ScrollView style={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.titleWrap}>
          <Text style={s.pageTitle}>Support Requests</Text>
          <Text style={s.pageDesc}>Submit a new request for emergency assistance or view the status of your existing requests.</Text>
        </View>

        {/* Emergency Banner */}
        <View style={s.emergencyBanner}>
          <Text style={s.emergencyIcon}>🚨</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.emergencyTitle}>Life-Threatening Emergency?</Text>
            <Text style={s.emergencyDesc}>Do not use this form. Call 911 or your local emergency response authority immediately.</Text>
          </View>
        </View>

        {/* Support Type */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Type of Support</Text>
          <View style={s.typeRow}>
            {SUPPORT_TYPES.map(t => (
              <TouchableOpacity
                key={t.id}
                style={[s.typeCell, supportType === t.id && s.typeCellActive]}
                onPress={() => setSupportType(t.id)}
              >
                <Text style={s.typeEmoji}>{t.emoji}</Text>
                <Text style={[s.typeLabel, supportType === t.id && { color: C.primary, fontWeight: '700' }]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Priority Level */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Priority Level</Text>
          <View style={s.priorityRow}>
            {PRIORITIES.map(p => (
              <TouchableOpacity
                key={p}
                style={[s.priorityBtn, priority === p && (p === 'Critical' ? s.priorityCritical : s.priorityActive)]}
                onPress={() => setPriority(p)}
              >
                {p === 'Critical' && priority === p && <Text>❗</Text>}
                <Text style={[
                  s.priorityTxt,
                  priority === p && (p === 'Critical' ? { color: '#fff' } : { color: C.primary }),
                ]}>
                  {p.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Current Location */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Current Location</Text>
          <View style={s.locRow}>
            <Text style={s.locIcon}>📍</Text>
            <TextInput
              style={s.locInput}
              value={location}
              onChangeText={setLocation}
            />
            <TouchableOpacity style={s.autoBtn}>
              <Text style={s.autoBtnTxt}>📍 Auto-detect</Text>
            </TouchableOpacity>
          </View>
          <View style={s.mapMini}>
            <View style={s.mapDot} />
          </View>
        </View>

        {/* Description */}
        <View style={s.card}>
          <View style={s.descHeader}>
            <Text style={s.cardTitle}>Description of Situation</Text>
            <Text style={s.optional}>Optional</Text>
          </View>
          <TextInput
            style={[s.input, s.textarea]}
            placeholder="Please provide specific details about your situation, number of people, and immediate needs..."
            placeholderTextColor={C.outline}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit */}
        <TouchableOpacity style={s.submitBtn} onPress={submit} activeOpacity={0.85}>
          <Text style={s.submitTxt}>➤  SUBMIT CRITICAL REQUEST</Text>
        </TouchableOpacity>

        {/* Recent Activity */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Recent Activity</Text>
          <View style={s.activityItem}>
            <View style={s.actRow}>
              <View style={[s.actDot, { backgroundColor: C.tertiaryFixedDim }]} />
              <Text style={s.actStatus}>PENDING</Text>
              <Text style={s.actTime}>10 mins ago</Text>
            </View>
            <Text style={s.actTitle}>Medical Assistance</Text>
            <Text style={s.actDesc}>Need insulin supply at shelter 4...</Text>
            <Text style={s.actLoc}>📍 Sector 7G Shelter</Text>
          </View>
          <View style={[s.activityItem, { opacity: 0.7 }]}>
            <View style={s.actRow}>
              <View style={[s.actDot, { backgroundColor: C.surfaceTint }]} />
              <Text style={s.actStatus}>RESOLVED</Text>
              <Text style={s.actTime}>2 days ago</Text>
            </View>
            <Text style={s.actTitle}>Evacuation Transport</Text>
            <Text style={s.actDesc}>Family of 4 needs transport from flood zone.</Text>
          </View>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  header: {
    alignItems: 'center', paddingVertical: 14,
    backgroundColor: C.surfaceContainerLowest,
    borderBottomWidth: 1, borderBottomColor: C.outlineVariant,
  },
  brand: { fontSize: 16, fontWeight: '900', color: C.primary, letterSpacing: 2 },
  scroll: { flex: 1 },
  titleWrap: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4 },
  pageTitle: { fontSize: 28, fontWeight: '900', color: C.onSurface },
  pageDesc: { fontSize: 14, color: C.onSurfaceVariant, marginTop: 4, lineHeight: 20 },
  emergencyBanner: {
    flexDirection: 'row', gap: 12, marginHorizontal: 16, marginTop: 16,
    backgroundColor: C.errorContainer + 'AA',
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.error + '50',
  },
  emergencyIcon: { fontSize: 24 },
  emergencyTitle: { fontSize: 14, fontWeight: '700', color: C.error },
  emergencyDesc: { fontSize: 13, color: C.onSurface, marginTop: 2, lineHeight: 18 },
  card: {
    marginHorizontal: 16, marginTop: 14,
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: C.outlineVariant,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: C.onSurface, marginBottom: 12 },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeCell: {
    flex: 1, borderWidth: 1, borderColor: C.outlineVariant,
    borderRadius: 12, padding: 14, alignItems: 'center', gap: 8,
    backgroundColor: C.surface,
  },
  typeCellActive: { borderColor: C.primary, borderWidth: 2, backgroundColor: C.primaryFixed },
  typeEmoji: { fontSize: 28 },
  typeLabel: { fontSize: 12, fontWeight: '600', color: C.onSurface },
  priorityRow: { flexDirection: 'row', gap: 8 },
  priorityBtn: {
    flex: 1, height: 40, borderRadius: 99, borderWidth: 1,
    borderColor: C.outlineVariant, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  priorityCritical: { backgroundColor: C.error, borderColor: C.error },
  priorityActive: { borderColor: C.primary, borderWidth: 2 },
  priorityTxt: { fontSize: 12, fontWeight: '700', color: C.onSurfaceVariant },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locIcon: { fontSize: 18 },
  locInput: {
    flex: 1, height: 46, borderWidth: 1, borderColor: C.outlineVariant,
    borderRadius: 10, paddingHorizontal: 12, fontSize: 13, color: C.onSurface,
    backgroundColor: C.surfaceContainerLow,
  },
  autoBtn: {
    paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8,
    backgroundColor: C.primaryFixed,
  },
  autoBtnTxt: { fontSize: 11, fontWeight: '600', color: C.primary },
  mapMini: {
    marginTop: 10, height: 80, backgroundColor: C.surfaceContainerHighest,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.outlineVariant,
  },
  mapDot: {
    width: 14, height: 14, borderRadius: 7, backgroundColor: C.primary,
    borderWidth: 3, borderColor: '#fff',
    shadowColor: C.primary, shadowOpacity: 0.4, shadowRadius: 4, elevation: 4,
  },
  descHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  optional: { fontSize: 12, color: C.outline },
  input: {
    borderWidth: 1, borderColor: C.outlineVariant, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: C.onSurface, backgroundColor: C.surfaceContainerLow,
  },
  textarea: { height: 100, paddingTop: 12 },
  submitBtn: {
    marginHorizontal: 16, marginTop: 16, height: 54,
    backgroundColor: C.error, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.error, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  submitTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  activityItem: {
    borderTopWidth: 1, borderTopColor: C.outlineVariant, paddingTop: 12, marginTop: 8, gap: 4,
  },
  actRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actDot: { width: 8, height: 8, borderRadius: 4 },
  actStatus: { fontSize: 10, fontWeight: '700', color: C.onSurface, textTransform: 'uppercase', letterSpacing: 0.5 },
  actTime: { fontSize: 11, color: C.onSurfaceVariant, marginLeft: 'auto' },
  actTitle: { fontSize: 15, fontWeight: '700', color: C.onSurface },
  actDesc: { fontSize: 13, color: C.onSurfaceVariant },
  actLoc: { fontSize: 12, color: C.onSurfaceVariant },
});
