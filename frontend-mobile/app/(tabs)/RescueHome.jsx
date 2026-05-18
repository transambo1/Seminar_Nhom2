import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  Platform, ActivityIndicator, RefreshControl, Alert 
} from 'react-native';
import * as SecureStore from 'expo-secure-store'; 
import { rescueService } from '../../src/api/rescueService'; 

const COLORS = {
  primary: '#1E293B',
  accent: '#F97316',
  blue: '#3B82F6',
  green: '#10B981',
  bg: '#F8FAFC',
  white: '#FFFFFF',
  textMain: '#0F172A',
  textSub: '#64748B'
};

export default function RescueHome() {
  const [missions, setMissions] = useState([]);
  const [filter, setFilter] = useState('WAITING');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rescuerId, setRescuerId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);

      // 🟢 Lấy ID của Người cứu hộ từ Profile đã đăng nhập
      const profileStr = await SecureStore.getItemAsync('userProfile');
      const profile = profileStr ? JSON.parse(profileStr) : null;
      
      // actualId ở đây đại diện cho định danh của bạn trong hệ thống cứu hộ
      const actualId = profile?.userId || 1; 
      setRescuerId(actualId);

      // 🟢 Gọi đồng thời: 1. Nhiệm vụ chưa ai nhận | 2. Nhiệm vụ đã giao cho tôi
      const [pendingRes, myRes] = await Promise.all([
        rescueService.getPendingRequests(), 
        rescueService.getMyMissions(actualId) // Gửi X-User-Id qua Header
      ]);

      // Gộp dữ liệu và đảm bảo không bị lặp ID nhiệm vụ
      const combined = [...(pendingRes.data || []), ...(myRes.data || [])];
      const unique = Array.from(new Map(combined.map(m => [m.id, m])).values());
      
      setMissions(unique);
    } catch (error) {
      console.error("Lỗi Fetch Data Cứu Hộ:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const renderMission = ({ item }) => {
    const isPending = item.status === 'PENDING';
    const isAssigned = item.status === 'ASSIGNED';
    const isInProgress = item.status === 'IN_PROGRESS';

    // Xác định màu sắc theo trạng thái để người cứu hộ dễ phân biệt
    let statusColor = COLORS.accent; // Cam cho PENDING
    if (isAssigned) statusColor = COLORS.blue; // Xanh cho ASSIGNED
    if (isInProgress) statusColor = COLORS.green; // Xanh lá cho IN_PROGRESS

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={[styles.typeBadge, { backgroundColor: statusColor + '15' }]}>
              <Text style={[styles.typeText, { color: statusColor }]}>{item.status}</Text>
            </View>
            <Text style={styles.distanceText}>📍 {item.distanceKm?.toFixed(1) || '0.0'} km</Text>
          </View>

          <Text style={styles.addressText} numberOfLines={1}>
            {item.description || 'Yêu cầu cứu hộ khẩn cấp'}
          </Text>
          
          <View style={styles.footerRow}>
            <View style={styles.metaItem}><Text style={styles.metaLabel}>MÃ SỐ</Text><Text style={styles.metaValue}>#{item.id}</Text></View>
            <View style={styles.metaItem}><Text style={styles.metaLabel}>MỨC ĐỘ</Text><Text style={[styles.metaValue, item.priorityLevel === 'CRITICAL' && {color: '#EF4444'}]}>{item.priorityLevel}</Text></View>
          </View>

          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: statusColor }]}
            onPress={() => Alert.alert("Thông tin", `Đang thực hiện nhiệm vụ #${item.id}`)}
          >
            <Text style={styles.btnText}>
              {isPending ? 'TIẾP NHẬN NHIỆM VỤ' : 'XEM ĐƯỜNG ĐI'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Nhiệm Vụ Cứu Hộ</Text>
        <View style={styles.userChip}>
          <View style={styles.onlineDot} />
          <Text style={styles.userIdText}>Rescuer ID: {rescuerId}</Text>
        </View>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => setFilter('WAITING')} style={[styles.tabItem, filter === 'WAITING' && styles.tabItemActive]}>
          <Text style={[styles.tabLabel, filter === 'WAITING' && styles.tabLabelActive]}>Mới nhất</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('DOING')} style={[styles.tabItem, filter === 'DOING' && styles.tabItemActive]}>
          <Text style={[styles.tabLabel, filter === 'DOING' && styles.tabLabelActive]}>Đang làm</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={missions.filter(m => {
          if (filter === 'WAITING') return m.status === 'PENDING';
          // 🟢 TAB ĐANG LÀM: Chỉ hiện những cái đã được gán cho mình
          return m.status === 'ASSIGNED' || m.status === 'IN_PROGRESS';
        })}
        renderItem={renderMission}
        keyExtractor={item => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
        ListEmptyComponent={<Text style={styles.emptyMsg}>Không có nhiệm vụ nào.</Text>}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 15, backgroundColor: COLORS.white },
  headerTitle: { fontSize: 24, fontWeight: '900', color: COLORS.textMain },
  userChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.green, marginRight: 6 },
  userIdText: { fontSize: 13, fontWeight: '700', color: COLORS.textSub },
  tabBar: { flexDirection: 'row', margin: 16, backgroundColor: '#E2E8F0', borderRadius: 12, padding: 4 },
  tabItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabItemActive: { backgroundColor: COLORS.white, elevation: 2 },
  tabLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textSub },
  tabLabelActive: { color: COLORS.textMain },
  card: { backgroundColor: COLORS.white, borderRadius: 20, marginBottom: 16, elevation: 3 },
  cardContent: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeText: { fontSize: 11, fontWeight: '900' },
  distanceText: { fontSize: 13, fontWeight: '700', color: COLORS.textSub },
  addressText: { fontSize: 18, fontWeight: '700', color: COLORS.textMain, marginBottom: 4 },
  footerRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12, marginBottom: 16 },
  metaItem: { flex: 1 },
  metaLabel: { fontSize: 9, color: COLORS.textSub, fontWeight: '800' },
  metaValue: { fontSize: 14, fontWeight: '700', color: COLORS.textMain },
  actionBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: COLORS.white, fontWeight: '900', fontSize: 14 },
  emptyMsg: { textAlign: 'center', marginTop: 100, color: COLORS.textSub }
});