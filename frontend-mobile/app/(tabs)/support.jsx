import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, SafeAreaView, Alert, ActivityIndicator, Platform,
  KeyboardAvoidingView
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { C } from '../../src/constants/colors';
import apiClient from '../../src/api/apiClient';

// 1. Cập nhật đúng Enum RequestType từ Backend
const SUPPORT_TYPES = [
  { id: 'MEDICAL', label: 'Medical', emoji: '🏥' },
  { id: 'FOOD', label: 'Food', emoji: '🍞' },
  { id: 'EVACUATION', label: 'Evacuation', emoji: '🏃' },
  { id: 'RESCUE', label: 'Rescue', emoji: '🚁' },
];

const PRIORITIES = [
  { id: 'CRITICAL', label: 'Critical' },
  { id: 'HIGH', label: 'High' },
  { id: 'NORMAL', label: 'Normal' }
];

// 2. Component Mini Map đã fix lỗi "Missing display name" và "Unexpected token"
const SupportMiniMap = React.memo(function SupportMiniMapComponent({ coordinate }) {
  return (
    <View style={s.mapMini}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        region={{
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        pitchEnabled={false}
        rotateEnabled={false}
        scrollEnabled={false}
      >
        <Marker coordinate={{
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
        }}>
          <View style={s.mapDot} />
        </Marker>
      </MapView>
    </View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.coordinate.latitude === nextProps.coordinate.latitude &&
    prevProps.coordinate.longitude === nextProps.coordinate.longitude
  );
});

export default function SupportScreen() {
  const [supportType, setSupportType] = useState(null);
  const [priority, setPriority] = useState('CRITICAL');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [numPeople, setNumPeople] = useState('1');
  const [recentRequests, setRecentRequests] = useState([]);
  
  const [coordinate, setCoordinate] = useState({ latitude: 10.7626, longitude: 106.6601 });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Lấy userId mặc định từ profile Trần Lâm Thành
  const currentUserId = 1; 

  useEffect(() => {
    handleAutoDetect();
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const res = await apiClient.get('/api/v1/support-requests/my');
      setRecentRequests(res.data.slice(0, 3));
    } catch (e) { console.warn(e); }
  };

  const handleAutoDetect = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({});
      const currentCoord = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setCoordinate(currentCoord);
      const reverseGeo = await Location.reverseGeocodeAsync(currentCoord);
      if (reverseGeo.length > 0) {
        const p = reverseGeo[0];
        setLocationName([p.streetNumber, p.street, p.district, p.city].filter(Boolean).join(', '));
      }
    } catch (error) { console.warn(error); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!supportType || !description) {
      Alert.alert('Missing Info', 'Please select support type and describe your situation.');
      return;
    }

    setSubmitting(true);
    try {
      // Payload khớp hoàn toàn với SupportCreateRequest.java
      const payload = {
        userId: currentUserId,
        requestType: supportType,
        description: description.trim(),
        numberOfPeople: parseInt(numPeople) || 1,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        priorityLevel: priority
      };

      const response = await apiClient.post('/api/v1/support-requests', payload);

      if (response.status === 201 || response.status === 200) {
        Alert.alert('🆘 Success', 'Emergency request submitted. Stay safe.');
        setDescription('');
        setSupportType(null);
        fetchMyRequests();
      }
    } catch (error) {
      Alert.alert('Error', 'Could not submit request. Check server connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={s.header}><Text style={s.brand}>STORMSHIELD</Text></View>
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.titleWrap}>
            <Text style={s.pageTitle}>Support Requests</Text>
            <Text style={s.pageDesc}>Yêu cầu cứu hộ khẩn cấp đến lực lượng chức năng.</Text>
          </View>

          <View style={s.emergencyBanner}>
            <Text style={s.emergencyIcon}>🚨</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.emergencyTitle}>Life-Threatening Emergency?</Text>
              <Text style={s.emergencyDesc}>Gọi ngay 113, 114 hoặc 115 nếu đang gặp nguy hiểm trực tiếp.</Text>
            </View>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Type of Support</Text>
            {/* 🟢 Bố cục 2:2 Grid */}
            <View style={s.typeGrid}>
              {SUPPORT_TYPES.map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={[s.typeCell, supportType === t.id && s.typeCellActive]}
                  onPress={() => setSupportType(t.id)}
                >
                  <Text style={s.typeEmoji}>{t.emoji}</Text>
                  <Text style={[s.typeLabel, supportType === t.id && { color: C.primary }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Priority Level</Text>
            <View style={s.priorityRow}>
              {PRIORITIES.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[s.priorityBtn, priority === p.id ? { backgroundColor: p.id === 'CRITICAL' ? C.error : p.id === 'HIGH' ? '#E65100' : C.primary } : s.priorityInactive]}
                  onPress={() => setPriority(p.id)}
                >
                  <Text style={[s.priorityTxt, priority === p.id ? { color: '#fff' } : { color: C.onSurfaceVariant }]}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Number of People</Text>
            <TextInput style={s.inputSmall} keyboardType="numeric" value={numPeople} onChangeText={setNumPeople} />
            <Text style={[s.cardTitle, { marginTop: 16 }]}>Location</Text>
            <View style={s.locRow}>
              <TextInput style={s.locInput} value={locationName} editable={false} />
              <TouchableOpacity style={s.autoBtn} onPress={handleAutoDetect}><Text style={s.autoBtnTxt}>📍 Reset</Text></TouchableOpacity>
            </View>
            <SupportMiniMap coordinate={coordinate} />
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Description</Text>
            <TextInput style={[s.input, s.textarea]} multiline value={description} onChangeText={setDescription} placeholder="Describe your needs..." />
          </View>

          <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={s.submitTxt}>➤  SUBMIT REQUEST</Text>}
          </TouchableOpacity>

          {recentRequests.length > 0 && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Recent Activity</Text>
              {recentRequests.map(req => (
                <View key={req.id} style={s.activityItem}>
                  <View style={s.actRow}>
                    <View style={[s.actDot, { backgroundColor: req.status === 'PENDING' ? '#f59e0b' : '#16a34a' }]} />
                    <Text style={s.actStatus}>{req.status}</Text>
                  </View>
                  <Text style={s.actTitle}>{req.requestType}</Text>
                  <Text style={s.actDesc} numberOfLines={1}>{req.description}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  header: { alignItems: 'center', paddingVertical: 14, backgroundColor: C.surfaceContainerLowest, borderBottomWidth: 1, borderBottomColor: C.outlineVariant },
  brand: { fontSize: 16, fontWeight: '900', color: C.primary, letterSpacing: 2 },
  scroll: { flex: 1 },
  titleWrap: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4 },
  pageTitle: { fontSize: 28, fontWeight: '900', color: C.onSurface },
  pageDesc: { fontSize: 14, color: C.onSurfaceVariant, marginTop: 4 },
  emergencyBanner: { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginTop: 16, backgroundColor: '#FEF2F2', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#FCA5A5' },
  emergencyIcon: { fontSize: 24 },
  emergencyTitle: { fontSize: 14, fontWeight: '700', color: '#B91C1C' },
  emergencyDesc: { fontSize: 13, color: '#444', marginTop: 2 },
  card: { marginHorizontal: 16, marginTop: 14, backgroundColor: C.surfaceContainerLowest, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: C.outlineVariant },
  cardTitle: { fontSize: 16, fontWeight: '700', color: C.onSurface, marginBottom: 12 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCell: { width: '48%', borderWidth: 1, borderColor: C.outlineVariant, borderRadius: 12, paddingVertical: 16, alignItems: 'center', backgroundColor: C.surface },
  typeCellActive: { borderColor: C.primary, borderWidth: 2, backgroundColor: '#EEF2FF' },
  typeEmoji: { fontSize: 26 },
  typeLabel: { fontSize: 11, fontWeight: '800', marginTop: 4 },
  priorityRow: { flexDirection: 'row', gap: 8 },
  priorityBtn: { flex: 1, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  priorityInactive: { borderWidth: 1, borderColor: C.outlineVariant },
  priorityTxt: { fontSize: 12, fontWeight: '700' },
  inputSmall: { width: 80, height: 40, borderWidth: 1, borderColor: C.outlineVariant, borderRadius: 8, textAlign: 'center' },
  locRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  locInput: { flex: 1, height: 46, borderWidth: 1, borderColor: C.outlineVariant, borderRadius: 10, paddingHorizontal: 12, backgroundColor: C.surfaceContainerLow },
  autoBtn: { paddingHorizontal: 12, backgroundColor: C.primaryFixed, borderRadius: 10, justifyContent: 'center' },
  autoBtnTxt: { fontSize: 11, fontWeight: '700', color: C.primary },
  mapMini: { height: 120, borderRadius: 12, overflow: 'hidden' },
  mapDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: C.primary, borderWidth: 2, borderColor: '#fff' },
  input: { borderWidth: 1, borderColor: C.outlineVariant, borderRadius: 12, padding: 12, backgroundColor: C.surfaceContainerLow },
  textarea: { height: 100, textAlignVertical: 'top' },
  submitBtn: { marginHorizontal: 16, marginTop: 16, height: 56, backgroundColor: C.error, borderRadius: 16, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  submitTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  activityItem: { borderTopWidth: 1, borderTopColor: C.outlineVariant, paddingTop: 12, marginTop: 8 },
  actRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actDot: { width: 8, height: 8, borderRadius: 4 },
  actStatus: { fontSize: 10, fontWeight: '800' },
  actTime: { fontSize: 11, color: C.onSurfaceVariant, marginLeft: 'auto' },
  actTitle: { fontSize: 15, fontWeight: '700', marginTop: 4 },
  actDesc: { fontSize: 13, color: C.onSurfaceVariant },
});