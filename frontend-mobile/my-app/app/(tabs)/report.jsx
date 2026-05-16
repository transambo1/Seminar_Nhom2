import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, SafeAreaView, Alert,
} from 'react-native';
import { C } from '../../src/constants/colors';

const INCIDENT_TYPES = [
  { id: 'flood', label: 'Flood', emoji: '🌊' },
  { id: 'tree', label: 'Tree Down', emoji: '🌳' },
  { id: 'power', label: 'Power Outage', emoji: '⚡' },
  { id: 'fire', label: 'Fire', emoji: '🔥' },
  { id: 'other', label: 'Other Emergency', emoji: '⚠️' },
];

export default function ReportScreen() {
  const [address, setAddress] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState('');

  const submit = () => {
    if (!address || !selectedType) {
      Alert.alert('Missing Info', 'Please fill in location and incident type.');
      return;
    }
    Alert.alert('✅ Submitted', 'Your incident report has been submitted to emergency services.', [
      { text: 'OK' },
    ]);
  };

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Text style={s.brand}>STORMSHIELD</Text>
      </View>
      <ScrollView style={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.titleWrap}>
          <Text style={s.pageTitle}>Report an Incident</Text>
          <Text style={s.pageDesc}>Provide critical information to emergency services. Your report helps coordinate response efforts.</Text>
        </View>

        {/* Location Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>📍 Location Details</Text>
          <Text style={s.fieldLabel}>Incident Address or Landmark</Text>
          <TextInput
            style={s.input}
            placeholder="e.g., 123 Main St or Intersection of 5th & Oak"
            placeholderTextColor={C.outline}
            value={address}
            onChangeText={setAddress}
          />
          <TouchableOpacity style={s.locationBtn}>
            <Text style={s.locationBtnTxt}>📍  Use Current Location</Text>
          </TouchableOpacity>
          <View style={s.mapPlaceholder}>
            <Text style={s.mapPin}>📍</Text>
          </View>
        </View>

        {/* Incident Type Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>⚠️ Incident Type</Text>
          <View style={s.typeGrid}>
            {INCIDENT_TYPES.map(t => (
              <TouchableOpacity
                key={t.id}
                style={[
                  s.typeCell,
                  t.id === 'other' && s.typeCellFull,
                  selectedType === t.id && s.typeCellActive,
                ]}
                onPress={() => setSelectedType(t.id)}
              >
                <Text style={s.typeEmoji}>{t.emoji}</Text>
                <Text style={[s.typeLabel, selectedType === t.id && s.typeLabelActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Photo Upload Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>📷 Photo or Video Evidence</Text>
          <TouchableOpacity style={s.uploadBox}>
            <View style={s.uploadIcon}>
              <Text style={{ fontSize: 32 }}>📁</Text>
            </View>
            <Text style={s.uploadLabel}>Tap to upload or drag media here</Text>
            <Text style={s.uploadSub}>JPG, PNG, MP4 (Max 20MB)</Text>
          </TouchableOpacity>
        </View>

        {/* Description Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>📄 Description</Text>
          <Text style={s.fieldLabel}>Provide any additional context (injuries, blocked access, etc.)</Text>
          <TextInput
            style={[s.input, s.textarea]}
            placeholder="Describe the situation..."
            placeholderTextColor={C.outline}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit */}
        <View style={s.submitWrap}>
          <TouchableOpacity style={s.submitBtn} onPress={submit} activeOpacity={0.85}>
            <Text style={s.submitTxt}>➤  Submit Incident Report</Text>
          </TouchableOpacity>
          <Text style={s.submitNote}>
            By submitting, you agree to share this information with local emergency services.
          </Text>
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
  card: {
    marginHorizontal: 16, marginTop: 16,
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: C.outlineVariant,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: C.onSurface, marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: C.onSurface, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: C.outlineVariant, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: C.onSurface, backgroundColor: C.surface,
  },
  textarea: { height: 100, paddingTop: 12 },
  locationBtn: {
    marginTop: 10, height: 46, borderWidth: 1, borderColor: C.outlineVariant,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.surfaceContainerLow,
  },
  locationBtnTxt: { fontSize: 14, fontWeight: '600', color: C.onSurface },
  mapPlaceholder: {
    marginTop: 10, height: 120, backgroundColor: C.surfaceVariant,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.outlineVariant,
  },
  mapPin: { fontSize: 32 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCell: {
    width: '47%', borderWidth: 2, borderColor: C.outlineVariant,
    borderRadius: 12, padding: 16, alignItems: 'center', gap: 6,
    backgroundColor: C.surface,
  },
  typeCellFull: { width: '100%', flexDirection: 'row', justifyContent: 'flex-start', gap: 12 },
  typeCellActive: { borderColor: C.primary, backgroundColor: C.primaryFixed },
  typeEmoji: { fontSize: 28 },
  typeLabel: { fontSize: 13, fontWeight: '600', color: C.onSurface },
  typeLabelActive: { color: C.primary },
  uploadBox: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: C.outlineVariant,
    borderRadius: 16, padding: 28, alignItems: 'center', gap: 8,
    backgroundColor: C.surface,
  },
  uploadIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: C.primaryFixedDim, alignItems: 'center', justifyContent: 'center',
  },
  uploadLabel: { fontSize: 14, fontWeight: '600', color: C.onSurface },
  uploadSub: { fontSize: 12, color: C.outline },
  submitWrap: { marginHorizontal: 16, marginTop: 20 },
  submitBtn: {
    height: 54, backgroundColor: C.primary, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.primary, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6,
  },
  submitTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  submitNote: { fontSize: 12, color: C.outline, textAlign: 'center', marginTop: 10, lineHeight: 16 },
});
