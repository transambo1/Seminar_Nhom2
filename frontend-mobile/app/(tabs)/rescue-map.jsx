import React, { useEffect, useState, useRef } from 'react';
import { 
  StyleSheet, Text, View, ActivityIndicator, 
  TouchableOpacity, Alert, Dimensions, Linking, Platform 
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { rescueService } from '../../src/api/rescueService'; 

const { width, height } = Dimensions.get('window');
const COLORS = {
  primary: '#041525',
  accent: '#FF6B00',
  blue: '#3B82F6',
  green: '#10B981',
  gray: '#94A3B8'
};

export default function RescueMapScreen() {
  const [loading, setLoading] = useState(true);
  const [activeMissions, setActiveMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [userId, setUserId] = useState(null);
  const mapRef = useRef(null);

  // Theo dõi vị trí của xe cứu hộ (🚒)
  useEffect(() => {
    let locationWatcher;
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      locationWatcher = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 10 },
        (loc) => setCurrentLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
      );
    })();
    return () => locationWatcher?.remove();
  }, []);

  // Lấy danh sách nhiệm vụ ASSIGNED/IN_PROGRESS
  const fetchMissions = async () => {
    try {
      const profileStr = await SecureStore.getItemAsync('userProfile'); // Lấy profile
      const profile = profileStr ? JSON.parse(profileStr) : null;
      const id = profile?.userId || 1;
      setUserId(id);

      const response = await rescueService.getMyMissions(id); // Gọi với Header
      if (response.data) {
        const doing = response.data.filter(m => m.status === 'ASSIGNED' || m.status === 'IN_PROGRESS');
        setActiveMissions(doing);
        if (doing.length === 1) setSelectedMission(doing[0]); // Tự chọn nếu chỉ có 1 việc
      }
    } catch (error) {
      console.error("Lỗi Map:", error.response?.status);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchMissions(); }, []);

  // Xử lý hoàn thành (Chuyển sang RESOLVED)
  const handleComplete = async () => {
    if (!selectedMission || !userId) return;
    Alert.alert("Xác nhận", "Bạn đã hoàn thành hỗ trợ tại điểm này?", [
      { text: "Hủy", style: "cancel" },
      { text: "Hoàn thành", onPress: async () => {
        try {
          setLoading(true);
          await rescueService.updateStatus(selectedMission.id, 'RESOLVED', userId); //
          Alert.alert("Thành công", "Đã cập nhật trạng thái: RESOLVED");
          setSelectedMission(null);
          await fetchMissions();
        } catch (e) {
          Alert.alert("Lỗi", "Không thể cập nhật. Kiểm tra log Backend.");
        } finally { setLoading(false); }
      }}
    ]);
  };

  const openNav = () => {
    if (!selectedMission) return;
    const url = Platform.select({
      ios: `maps:0,0?q=Rescue@${selectedMission.latitude},${selectedMission.longitude}`,
      android: `geo:0,0?q=${selectedMission.latitude},${selectedMission.longitude}(Rescue)`
    });
    Linking.openURL(url);
  };

  if (loading && !currentLocation) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.accent} /></View>;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: currentLocation?.latitude || 10.762622,
          longitude: currentLocation?.longitude || 106.660172,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
      >
        {/* Icon xe cứu hộ */}
        {currentLocation && (
          <Marker coordinate={currentLocation}>
            <View style={styles.rescueMarker}><Text style={{fontSize: 22}}>🚒</Text></View>
          </Marker>
        )}

        {/* Các điểm nạn nhân */}
        {activeMissions.map(m => (
          <Marker key={m.id} coordinate={{ latitude: m.latitude, longitude: m.longitude }} onPress={() => setSelectedMission(m)}>
            <View style={[styles.citizenMarker, selectedMission?.id === m.id && styles.selectedMarker]}>
              <Text style={{fontSize: 22}}>🆘</Text>
            </View>
          </Marker>
        ))}

        {selectedMission && currentLocation && (
          <Polyline 
            coordinates={[currentLocation, { latitude: selectedMission.latitude, longitude: selectedMission.longitude }]} 
            strokeColor={COLORS.blue} strokeWidth={4} lineDashPattern={[5, 5]} 
          />
        )}
      </MapView>

      {/* Bảng thông tin */}
      {selectedMission && (
        <View style={styles.infoPanel}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedMission(null)}>
            <Text style={{color: COLORS.gray, fontWeight: 'bold'}}>ĐÓNG</Text>
          </TouchableOpacity>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.typeLabel}>{selectedMission.requestType}</Text>
              <Text style={styles.missionId}>Mã số #{selectedMission.id}</Text>
            </View>
            <TouchableOpacity style={styles.navBtn} onPress={openNav}>
              <Text style={{fontSize: 18}}>🗺️</Text>
              <Text style={styles.navTxt}>Dẫn đường</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.label}>VỊ TRÍ HIỆN TRƯỜNG</Text>
            <Text style={styles.addressValue} numberOfLines={2}>{selectedMission.affectedArea || selectedMission.description}</Text>
          </View>
          <TouchableOpacity style={styles.completeBtn} onPress={handleComplete}>
            <Text style={styles.completeBtnTxt}>XÁC NHẬN HOÀN THÀNH</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  map: { width, height },
  rescueMarker: { backgroundColor: '#fff', padding: 5, borderRadius: 25, borderWidth: 2, borderColor: COLORS.blue },
  citizenMarker: { backgroundColor: '#fff', padding: 5, borderRadius: 25, borderWidth: 2, borderColor: COLORS.accent },
  selectedMarker: { borderColor: COLORS.blue, transform: [{scale: 1.1}] },
  infoPanel: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, elevation: 20 },
  closeBtn: { alignSelf: 'flex-end', marginBottom: 5 },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  typeLabel: { fontSize: 22, fontWeight: '900' },
  missionId: { fontSize: 13, color: COLORS.gray },
  navBtn: { alignItems: 'center' },
  navTxt: { fontSize: 10, fontWeight: 'bold', color: COLORS.blue },
  addressBox: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '800', color: COLORS.gray, marginBottom: 5 },
  addressValue: { fontSize: 16, fontWeight: '700' },
  completeBtn: { backgroundColor: COLORS.green, paddingVertical: 18, borderRadius: 18, alignItems: 'center' },
  completeBtnTxt: { color: '#fff', fontWeight: '900', fontSize: 16 },
});