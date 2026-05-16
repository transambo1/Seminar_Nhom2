import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, SafeAreaView, Alert, ActivityIndicator, Platform,
  KeyboardAvoidingView
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { C } from '../../src/constants/colors';

const SUPPORT_TYPES = [
  { id: 'medical', label: 'Medical', emoji: '🏥' },
  { id: 'food', label: 'Food / Water', emoji: '💧' },
  { id: 'rescue', label: 'Rescue', emoji: '🚁' },
];
const PRIORITIES = ['Critical', 'High', 'Normal'];

// 🟢 COMPONENT BẢN ĐỒ MINI ĐƯỢC MEMOIZE CHỐNG LAG KHI GÕ PHÍM
const SupportMiniMap = React.memo(({ coordinate }) => {
  return (
    <View style={s.mapMini}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          ...coordinate,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        region={{
          ...coordinate,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        pitchEnabled={false}
        rotateEnabled={false}
        scrollEnabled={false} // Khóa cuộn để làm mini map hiển thị
      >
        <Marker coordinate={coordinate}>
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

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function SupportScreen() {
  const [supportType, setSupportType] = useState(null);
  const [priority, setPriority] = useState('Critical');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  
  // State phục vụ vị trí thật
  const [coordinate, setCoordinate] = useState({ latitude: 10.762622, longitude: 106.660172 });
  const [locationLoading, setLocationLoading] = useState(false);

  // Tự động lấy vị trí khi mở trang
  useEffect(() => {
    handleAutoDetect();
  }, []);

  const handleAutoDetect = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi quyền', 'Vui lòng cấp quyền vị trí để lấy tọa độ tự động.');
        setLocationLoading(false);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const currentCoord = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setCoordinate(currentCoord);

      // Dịch tọa độ ra địa chỉ text
      const reverseGeo = await Location.reverseGeocodeAsync(currentCoord);
      if (reverseGeo.length > 0) {
        const place = reverseGeo[0];
        const addr = [place.name, place.street, place.district, place.city].filter(Boolean).join(', ');
        setLocation(addr);
      } else {
        setLocation(`${currentCoord.latitude.toFixed(4)}, ${currentCoord.longitude.toFixed(4)}`);
      }
    } catch (error) {
      console.warn(error);
    } finally {
      setLocationLoading(false);
    }
  };

  const submit = () => {
    if (!supportType) {
      Alert.alert('Missing Info', 'Please select a type of support.');
      return;
    }
    Alert.alert('🆘 Request Submitted', 'Emergency services have been notified. Stay calm and remain visible.', [{ text: 'OK' }]);
  };

  // Hàm hỗ trợ đổi màu theo Priority
  const getPriorityStyle = (p) => {
    if (priority !== p) return s.priorityInactive;
    if (p === 'Critical') return { backgroundColor: C.error, borderColor: C.error };
    if (p === 'High') return { backgroundColor: '#E65100', borderColor: '#E65100' }; // Màu cam đậm
    if (p === 'Normal') return { backgroundColor: C.primary, borderColor: C.primary }; // Màu xanh chủ đạo
  };

  return (
    <SafeAreaView style={s.root}>
      {/* 🟢 Bọc KeyboardAvoidingView để đẩy nội dung lên khi mở bàn phím */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
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
                  <Text style={[s.typeLabel, supportType === t.id && { color: C.primary, fontWeight: '800' }]}>
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
                  style={[s.priorityBtn, getPriorityStyle(p)]}
                  onPress={() => setPriority(p)}
                >
                  {p === 'Critical' && priority === p && <Text style={{fontSize: 12}}>❗</Text>}
                  <Text style={[
                    s.priorityTxt,
                    priority === p ? { color: '#fff' } : { color: C.onSurfaceVariant },
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
                placeholder="Enter location or auto-detect..."
              />
              <TouchableOpacity style={s.autoBtn} onPress={handleAutoDetect} disabled={locationLoading}>
                {locationLoading ? (
                  <ActivityIndicator color={C.primary} size="small" />
                ) : (
                  <Text style={s.autoBtnTxt}>📍 Auto-detect</Text>
                )}
              </TouchableOpacity>
            </View>
            
            {/* 🟢 Gọi Bản đồ Mini đã được chống giật */}
            <SupportMiniMap coordinate={coordinate} />
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
                <View style={[s.actDot, { backgroundColor: C.surfaceTint || '#16a34a' }]} />
                <Text style={s.actStatus}>RESOLVED</Text>
                <Text style={s.actTime}>2 days ago</Text>
              </View>
              <Text style={s.actTitle}>Evacuation Transport</Text>
              <Text style={s.actDesc}>Family of 4 needs transport from flood zone.</Text>
            </View>
          </View>
          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  header: { alignItems: 'center', paddingVertical: 14, backgroundColor: C.surfaceContainerLowest, borderBottomWidth: 1, borderBottomColor: C.outlineVariant },
  brand: { fontSize: 16, fontWeight: '900', color: C.primary, letterSpacing: 2 },
  scroll: { flex: 1 },
  titleWrap: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4 },
  pageTitle: { fontSize: 28, fontWeight: '900', color: C.onSurface },
  pageDesc: { fontSize: 14, color: C.onSurfaceVariant, marginTop: 4, lineHeight: 20 },
  emergencyBanner: { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginTop: 16, backgroundColor: C.errorContainer + 'AA', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.error + '50' },
  emergencyIcon: { fontSize: 24 },
  emergencyTitle: { fontSize: 14, fontWeight: '700', color: C.error },
  emergencyDesc: { fontSize: 13, color: C.onSurface, marginTop: 2, lineHeight: 18 },
  card: { marginHorizontal: 16, marginTop: 14, backgroundColor: C.surfaceContainerLowest, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: C.outlineVariant, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: C.onSurface, marginBottom: 12 },
  
  typeRow: { flexDirection: 'row', gap: 8 },
  typeCell: { flex: 1, borderWidth: 1, borderColor: C.outlineVariant, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: C.surface },
  typeCellActive: { borderColor: C.primary, borderWidth: 2, backgroundColor: C.primaryFixed },
  typeEmoji: { fontSize: 26 },
  typeLabel: { fontSize: 11, fontWeight: '600', color: C.onSurface, textAlign: 'center' }, // 🟢 Ép căn giữa và giảm size chữ
  
  priorityRow: { flexDirection: 'row', gap: 8 },
  priorityBtn: { flex: 1, height: 40, borderRadius: 99, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  priorityInactive: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.outlineVariant },
  priorityTxt: { fontSize: 12, fontWeight: '700' },
  
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locIcon: { fontSize: 18 },
  locInput: { flex: 1, height: 46, borderWidth: 1, borderColor: C.outlineVariant, borderRadius: 10, paddingHorizontal: 12, fontSize: 13, color: C.onSurface, backgroundColor: C.surfaceContainerLow },
  autoBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: C.primaryFixed, height: 46, justifyContent: 'center' },
  autoBtnTxt: { fontSize: 11, fontWeight: '700', color: C.primary },
  
  // BẢN ĐỒ MINI MỚI
  mapMini: { marginTop: 12, height: 120, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: C.outlineVariant },
  mapDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: C.primary, borderWidth: 3, borderColor: '#fff', shadowColor: C.primary, shadowOpacity: 0.5, shadowRadius: 6, elevation: 4 },
  
  descHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  optional: { fontSize: 12, color: C.outline },
  input: { borderWidth: 1, borderColor: C.outlineVariant, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: C.onSurface, backgroundColor: C.surfaceContainerLow },
  textarea: { height: 100, paddingTop: 12 },
  
  submitBtn: { marginHorizontal: 16, marginTop: 16, height: 54, backgroundColor: C.error, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: C.error, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  submitTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  
  activityItem: { borderTopWidth: 1, borderTopColor: C.outlineVariant, paddingTop: 12, marginTop: 8, gap: 4 },
  actRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actDot: { width: 8, height: 8, borderRadius: 4 },
  actStatus: { fontSize: 10, fontWeight: '700', color: C.onSurface, textTransform: 'uppercase', letterSpacing: 0.5 },
  actTime: { fontSize: 11, color: C.onSurfaceVariant, marginLeft: 'auto' },
  actTitle: { fontSize: 15, fontWeight: '700', color: C.onSurface },
  actDesc: { fontSize: 13, color: C.onSurfaceVariant },
  actLoc: { fontSize: 12, color: C.onSurfaceVariant },
});