import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  TextInput, SafeAreaView, Alert, ActivityIndicator, Image, Platform
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { C } from '../../src/constants/colors';

const INCIDENT_TYPES = [
  { id: 'flood', label: 'Flood', emoji: '🌊' },
  { id: 'tree', label: 'Tree Down', emoji: '🌳' },
  { id: 'power', label: 'Power Outage', emoji: '⚡' },
  { id: 'fire', label: 'Fire', emoji: '🔥' },
  { id: 'other', label: 'Other Emergency', emoji: '⚠️' },
];

// 🟢 COMPONENT MAP ĐƯỢC TÁCH RIÊNG VÀ BỌC REACT.MEMO ĐỂ CHỐNG VĂNG FOCUS KHI GÕ CHỮ
// SỬA ĐOẠN NÀY:
const IncidentMap = React.memo(function IncidentMapComponent({ coordinate, mapRef }) {
  return (
    <View style={s.mapContainer}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          ...coordinate,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <Marker coordinate={coordinate} title="Vị trí sự cố" />
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
export default function ReportScreen() {
  const mapRef = useRef(null);
  const [address, setAddress] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState('');
  
  const [image, setImage] = useState(null); 
  const [locationLoading, setLocationLoading] = useState(false);
  const [coordinate, setCoordinate] = useState({
    latitude: 10.762622,
    longitude: 106.660172, 
  });

  // Tự động lấy vị trí khi mở trang
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập bị từ chối', 'Vui lòng cấp quyền GPS để lấy vị trí tự động.');
        setLocationLoading(false);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const currentCoord = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setCoordinate(currentCoord);

      mapRef.current?.animateToRegion({
        ...currentCoord,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);

      const reverseGeo = await Location.reverseGeocodeAsync(currentCoord);
      if (reverseGeo.length > 0) {
        const place = reverseGeo[0];
        const formattedAddress = [
          place.name,
          place.street,
          place.subregion,
          place.district,
          place.city
        ].filter(Boolean).join(', ');
        setAddress(formattedAddress);
      }
    } catch (error) {
      console.warn(error);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleAddressSearch = async () => {
    if (!address.trim()) return;
    try {
      const results = await Location.geocodeAsync(address);
      if (results.length > 0) {
        const targetCoord = { latitude: results[0].latitude, longitude: results[0].longitude };
        setCoordinate(targetCoord);
        mapRef.current?.animateToRegion({
          ...targetCoord,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 1000);
      }
    } catch (error) {
      console.warn(error);
    }
  };

  // 🟢 ĐÃ SỬA: LẤY ẢNH MẶC ĐỊNH CỦA ĐIỆN THOẠI KHÔNG QUA MÀN HÌNH CẮT
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập bị từ chối', 'Ứng dụng cần quyền bộ sưu tập để tải ảnh.');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // 🔴 Đổi thành false để lấy thẳng ảnh gốc, không bắt crop
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setImage(result.assets[0].uri); 
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn được ảnh.');
    }
  };

  const submit = () => {
    if (!address || !selectedType) {
      Alert.alert('Missing Info', 'Please fill in location and incident type.');
      return;
    }
    Alert.alert('✅ Submitted', 'Your incident report has been submitted to emergency services.');
  };

  return (
  
    <SafeAreaView style={s.root}>
        <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} // Khoảng cách đệm tránh dính sát bàn phím
      >
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
            onSubmitEditing={handleAddressSearch} 
            returnKeyType="search"
          />
          <TouchableOpacity style={s.locationBtn} onPress={getCurrentLocation} disabled={locationLoading}>
            {locationLoading ? (
              <ActivityIndicator color={C.onSurface} size="small" />
            ) : (
              <Text style={s.locationBtnTxt}>📍   Use Current Location</Text>
            )}
          </TouchableOpacity>
          
          {/* Gọi Component Map đã được memoized tối ưu hiệu năng */}
          <IncidentMap coordinate={coordinate} mapRef={mapRef} />
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
          <TouchableOpacity style={s.uploadBox} onPress={pickImage}>
            {image ? (
              <View style={s.previewContainer}>
                <Image source={{ uri: image }} style={s.imagePreview} />
                <TouchableOpacity style={s.removeImageBtn} onPress={() => setImage(null)}>
                  <Text style={s.removeImageTxt}>✕ Thay đổi ảnh</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={s.uploadIcon}>
                  <Text style={{ fontSize: 32 }}>📁</Text>
                </View>
                <Text style={s.uploadLabel}>Tap to upload media from device</Text>
                <Text style={s.uploadSub}>JPG, PNG, MP4 (Max 20MB)</Text>
              </>
            )}
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
            <Text style={s.submitTxt}>➤   Submit Incident Report</Text>
          </TouchableOpacity>
          <Text style={s.submitNote}>
            By submitting, you agree to share this information with local emergency services.
          </Text>
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
  card: { marginHorizontal: 16, marginTop: 16, backgroundColor: C.surfaceContainerLowest, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: C.outlineVariant, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: C.onSurface, marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: C.onSurface, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: C.outlineVariant, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: C.onSurface, backgroundColor: C.surface },
  textarea: { height: 100, paddingTop: 12 },
  locationBtn: { marginTop: 10, height: 46, borderWidth: 1, borderColor: C.outlineVariant, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: C.surfaceContainerLow },
  locationBtnTxt: { fontSize: 14, fontWeight: '600', color: C.onSurface },
  mapContainer: { marginTop: 12, height: 160, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: C.outlineVariant },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCell: { width: '47%', borderWidth: 2, borderColor: C.outlineVariant, borderRadius: 12, padding: 16, alignItems: 'center', gap: 6, backgroundColor: C.surface },
  typeCellFull: { width: '100%', flexDirection: 'row', justifyContent: 'flex-start', gap: 12 },
  typeCellActive: { borderColor: C.primary, backgroundColor: C.primaryFixed },
  typeEmoji: { fontSize: 28 },
  typeLabel: { fontSize: 13, fontWeight: '600', color: C.onSurface },
  typeLabelActive: { color: C.primary },
  uploadBox: { borderWidth: 2, borderStyle: 'dashed', borderColor: C.outlineVariant, borderRadius: 16, padding: 20, alignItems: 'center', gap: 8, backgroundColor: C.surface, minHeight: 140, justifyContent: 'center' },
  uploadIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.outlineVariant, alignItems: 'center', justifyContent: 'center' },
  uploadLabel: { fontSize: 14, fontWeight: '600', color: C.onSurface, textAlign: 'center' },
  uploadSub: { fontSize: 12, color: C.outline },
  previewContainer: { width: '100%', alignItems: 'center', gap: 10 },
  imagePreview: { width: '100%', height: 180, borderRadius: 12, resizeMode: 'cover' },
  removeImageBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20 },
  removeImageTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  submitWrap: { marginHorizontal: 16, marginTop: 20 },
  submitBtn: { height: 54, backgroundColor: C.primary, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: C.primary, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 },
  submitTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  submitNote: { fontSize: 12, color: C.outline, textAlign: 'center', marginTop: 10, lineHeight: 16 },
});