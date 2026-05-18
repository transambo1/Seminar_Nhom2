import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Image, Alert, ActivityIndicator, Platform, KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // 🟢 Fix lệch iOS
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { router } from 'expo-router';
import { C } from '../../src/constants/colors';
import apiClient from '../../src/api/apiClient';

// Map đúng Enum AlertType từ Backend
const INCIDENT_TYPES = [
  { id: 'STORM', label: 'Bão/Lốc', emoji: '⛈️' },
  { id: 'FLOOD', label: 'Lũ lụt', emoji: '🌊' },
  { id: 'FIRE', label: 'Hỏa hoạn', emoji: '🔥' },
  { id: 'LANDSLIDE', label: 'Sạt lở', emoji: '⛰️' },
  { id: 'OTHER', label: 'Khác', emoji: '⚠️' },
];

const SEVERITY_LEVELS = [
  { id: 'LOW', label: 'Thấp', color: '#16a34a' },
  { id: 'MEDIUM', label: 'Trung bình', color: '#f59e0b' },
  { id: 'HIGH', label: 'Cao', color: '#ea580c' },
  { id: 'CRITICAL', label: 'Khẩn cấp', color: '#ba1a1a' },
];

export default function ReportScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [severity, setSeverity] = useState('MEDIUM');
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Đang xác định vị trí...');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Vui lòng cho phép truy cập vị trí để gửi báo cáo.');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      
      // Lấy tên địa danh cho trường affectedArea
      let reverse = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      });
      if (reverse.length > 0) {
        const r = reverse[0];
        setAddress(`${r.streetNumber || ''} ${r.street || ''}, ${r.subregion || ''}, ${r.region || ''}`.trim());
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };
const resetForm = () => {
  setTitle('');
  setDescription('');
  setSelectedType(null);
  setSeverity('MEDIUM');
  setImage(null);
};
  const handleSubmit = async () => {
    if (!title || !description || !selectedType) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền tiêu đề, mô tả và chọn loại sự cố.');
      return;
    }

    setSubmitting(true);
    try {
      // Body khớp 100% với DTO ở Backend
      const payload = {
        userId: 1, // Tạm thời hardcode, sau này lấy từ AuthContext của Trần Lâm Thành
        title: title.trim(),
        description: description.trim(),
        incidentType: selectedType, 
        severityLevel: severity,    
        affectedArea: address,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        imageUrl: image, // Backend nhận String
      };

      const response = await apiClient.post('/api/v1/incident-reports', payload);

      if (response.status === 201 || response.status === 200) {
        resetForm();
        Alert.alert('Thành công', 'Báo cáo đã được gửi và chờ phê duyệt.', [
          { text: 'Xong', onPress: () => router.replace('/(tabs)') }
        ]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể gửi báo cáo. Vui lòng kiểm tra Server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} 
      >
        <ScrollView 
          contentContainerStyle={s.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.pageTitle}>Gửi báo cáo sự cố</Text>

          <View style={s.section}>
            <Text style={s.label}>Hình ảnh hiện trường</Text>
            <TouchableOpacity style={s.imagePicker} onPress={pickImage}>
              {image ? <Image source={{ uri: image }} style={s.previewImage} /> : <Text style={s.pickerTxt}>📸 Nhấn để chọn ảnh</Text>}
            </TouchableOpacity>
          </View>

          <View style={s.section}>
            <Text style={s.label}>Tiêu đề</Text>
            <TextInput style={s.input} value={title} onChangeText={setTitle} placeholder="Vd: Ngập lụt nặng tại đường Lữ Gia" />
          </View>

          <View style={s.section}>
            <Text style={s.label}>Loại sự cố</Text>
            <View style={s.typeGrid}>
              {INCIDENT_TYPES.map(t => (
                <TouchableOpacity 
                  key={t.id} 
                  style={[s.typeCard, selectedType === t.id && s.typeCardActive]} 
                  onPress={() => setSelectedType(t.id)}
                >
                  <Text style={s.typeEmoji}>{t.emoji}</Text>
                  <Text style={s.typeLabel}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.label}>Mức độ nghiêm trọng</Text>
            <View style={s.sevRow}>
              {SEVERITY_LEVELS.map(lv => (
                <TouchableOpacity 
                  key={lv.id} 
                  style={[s.sevBtn, severity === lv.id && { backgroundColor: lv.color }]} 
                  onPress={() => setSeverity(lv.id)}
                >
                  <Text style={[s.sevBtnTxt, severity === lv.id && { color: '#fff' }]}>{lv.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.label}>Mô tả chi tiết</Text>
            <TextInput 
              style={[s.input, s.textArea]} 
              multiline 
              value={description} 
              onChangeText={setDescription} 
              placeholder="Mô tả tình hình thực tế..." 
            />
          </View>

          <View style={s.section}>
            <Text style={s.label}>Vị trí (📍 {address})</Text>
            {location && (
              <MapView
                style={s.miniMap}
                scrollEnabled={false}
                initialRegion={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker coordinate={location.coords} />
              </MapView>
            )}
          </View>

          <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={s.submitBtnTxt}>GỬI BÁO CÁO</Text>}
          </TouchableOpacity>
          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 40 },
  pageTitle: { fontSize: 26, fontWeight: '900', marginBottom: 20, color: C.primary },
  section: { marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '800', color: '#555', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14, padding: 16, fontSize: 16, color: '#1e293b' },
  textArea: { height: 120, textAlignVertical: 'top' },
  imagePicker: { height: 200, backgroundColor: '#f1f5f9', borderRadius: 16, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderStyle: 'dashed', borderWidth: 1, borderColor: '#cbd5e1' },
  previewImage: { width: '100%', height: '100%' },
  pickerTxt: { color: '#64748b', fontWeight: '600' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCard: { width: '31%', backgroundColor: '#fff', paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#f1f5f9' },
  typeCardActive: { borderColor: C.primary, backgroundColor: '#f5f7ff' },
  typeEmoji: { fontSize: 28, marginBottom: 6 },
  typeLabel: { fontSize: 12, fontWeight: '800', color: '#334155' },
  sevRow: { flexDirection: 'row', gap: 8 },
  sevBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1.5, borderColor: '#f1f5f9' },
  sevBtnTxt: { fontSize: 13, fontWeight: '800', color: '#64748b' },
  miniMap: { height: 160, borderRadius: 16, marginTop: 8, overflow: 'hidden' },
  submitBtn: { backgroundColor: '#ba1a1a', height: 58, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: '#ba1a1a', shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  submitBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1.5 },
});