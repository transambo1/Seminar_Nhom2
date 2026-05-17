import React, { useEffect, useState, useRef } from 'react';
import { 
  StyleSheet, Text, View, ActivityIndicator, 
  TouchableOpacity, Alert, Dimensions 
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
  gray: '#94A3B8'
};

export default function RescueMapScreen() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [activeMission, setActiveMission] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const mapRef = useRef(null);

  // 1. Lấy vị trí thực tế của bạn
  const getRescueLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Lỗi", "Ứng dụng cần quyền truy cập vị trí để điều hướng.");
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    const coords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    setCurrentLocation(coords);
    return coords;
  };

  // 2. Lấy nhiệm vụ đang làm từ Backend
  const fetchActiveMission = async (id) => {
    try {
      const response = await rescueService.getMissionsByRescueId(id);
      if (response && response.data) {
        // Tìm ca IN_PROGRESS hoặc ASSIGNED
        const data = Array.isArray(response.data) ? response.data : [response.data];
        const mission = data.find(m => m.status === 'IN_PROGRESS' || m.status === 'ASSIGNED');
        setActiveMission(mission);
      }
    } catch (error) {
      console.error("Lỗi lấy nhiệm vụ:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      const coords = await getRescueLocation();
      const storedUserId = await SecureStore.getItemAsync('userId');
      if (storedUserId) {
        setUserId(storedUserId);
        await fetchActiveMission(storedUserId);
      } else {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleUpdateStatus = async () => {
    if (!activeMission) return;
    const nextStatus = activeMission.status === 'ASSIGNED' ? 'IN_PROGRESS' : 'RESOLVED';
    try {
      setLoading(true);
      await rescueService.updateStatus(activeMission.id, nextStatus);
      Alert.alert("Thành công", `Đã chuyển sang trạng thái: ${nextStatus}`);
      await fetchActiveMission(userId);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}><ActivityIndicator size="large" color={COLORS.accent} /></View>
    );
  }

  return (
    <View style={styles.container}>
      {/* BẢN ĐỒ */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: currentLocation?.latitude || 10.762622,
          longitude: currentLocation?.longitude || 106.660172,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {/* Marker của Rescue (Màu xanh) */}
        {currentLocation && (
          <Marker coordinate={currentLocation} title="Vị trí của bạn">
            <View style={styles.rescueMarker}>
              <Text style={{fontSize: 20}}>🚒</Text>
            </View>
          </Marker>
        )}

        {/* Marker của Citizen & Đường kẻ thẳng */}
        {activeMission && (
          <>
            <Marker 
              coordinate={{ latitude: activeMission.latitude, longitude: activeMission.longitude }} 
              title="Điểm cứu hộ"
            >
              <View style={styles.citizenMarker}>
                <Text style={{fontSize: 20}}>🆘</Text>
              </View>
            </Marker>

            {currentLocation && (
              <Polyline
                coordinates={[
                  currentLocation,
                  { latitude: activeMission.latitude, longitude: activeMission.longitude }
                ]}
                strokeColor={COLORS.blue}
                strokeWidth={4}
                lineDashPattern={[10, 10]} // Tạo hiệu ứng đường đứt đoạn
              />
            )}
          </>
        )}
      </MapView>

      {/* PANEL THÔNG TIN PHÍA DƯỚI */}
      {activeMission ? (
        <View style={styles.infoPanel}>
          <View style={styles.dragIcon} />
          
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.typeLabel}>{activeMission.requestType}</Text>
              <Text style={styles.missionId}>Nhiệm vụ #{activeMission.id}</Text>
            </View>
            <View style={styles.statusBadge}>
               <Text style={styles.statusText}>{activeMission.status}</Text>
            </View>
          </View>

          <View style={styles.addressBox}>
            <Text style={styles.label}>ĐỊA CHỈ KHẨN CẤP</Text>
            <Text style={styles.addressValue} numberOfLines={2}>
              {activeMission.description || 'Vị trí hiện trường cứu hộ'}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>KHOẢNG CÁCH</Text>
              <Text style={styles.statValue}>~{activeMission.distanceKm?.toFixed(1) || '0'} KM</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>SỐ NGƯỜI</Text>
              <Text style={styles.statValue}>{activeMission.numberOfPeople} NGƯỜI</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.actionBtn} onPress={handleUpdateStatus}>
            <Text style={styles.btnText}>
              {activeMission.status === 'ASSIGNED' ? 'BẮT ĐẦU NHIỆM VỤ' : 'XÁC NHẬN HOÀN THÀNH'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Chưa có nhiệm vụ nào được phân công.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  map: { width: width, height: height },
  
  // Markers
  rescueMarker: { backgroundColor: '#fff', padding: 5, borderRadius: 20, borderWidth: 2, borderColor: COLORS.blue },
  citizenMarker: { backgroundColor: '#fff', padding: 5, borderRadius: 20, borderWidth: 2, borderColor: COLORS.accent },

  // Info Panel
  infoPanel: {
    position: 'absolute', bottom: 0, width: '100%',
    backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30,
    padding: 24, elevation: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10
  },
  dragIcon: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 15 },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  typeLabel: { fontSize: 22, fontWeight: '900', color: COLORS.primary },
  missionId: { fontSize: 13, color: COLORS.gray },
  statusBadge: { backgroundColor: '#DBEAFE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: COLORS.blue, fontSize: 11, fontWeight: 'bold' },

  addressBox: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '800', color: COLORS.gray, letterSpacing: 1, marginBottom: 5 },
  addressValue: { fontSize: 16, fontWeight: '600', color: COLORS.primary, lineHeight: 22 },

  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 15, marginBottom: 25 },
  statItem: { flex: 1 },
  statLabel: { fontSize: 10, color: COLORS.gray, marginBottom: 3 },
  statValue: { fontSize: 16, fontWeight: '800', color: COLORS.primary },

  actionBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15, letterSpacing: 1 },

  emptyCard: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 5 },
  emptyText: { fontWeight: 'bold', color: COLORS.gray }
});