import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  Platform, ActivityIndicator, RefreshControl, Alert 
} from 'react-native';
import * as SecureStore from 'expo-secure-store'; 
import { rescueService } from '../../src/api/rescueService'; 

// Bảng màu theo layout mẫu
const COLORS = {
  primary: '#1E293B',
  accent: '#F97316',
  blue: '#3B82F6',
  green: '#10B981',
  bg: '#F8FAFC',
  white: '#FFFFFF',
  textMain: '#0F172A',
  textSub: '#64748B',
  border: '#E2E8F0'
};

export default function RescueHome() {
  const [missions, setMissions] = useState([]);
  const [filter, setFilter] = useState('WAITING');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const actualId = await SecureStore.getItemAsync('userId');
      setUserId(actualId);

      const [pendingRes, myRes] = await Promise.all([
        rescueService.getPendingRequests(),
        actualId ? rescueService.getMyMissions(actualId) : Promise.resolve({ data: [] })
      ]);

      const combined = [...(pendingRes.data || []), ...(myRes.data || [])];
      const unique = Array.from(new Map(combined.map(m => [m.id, m])).values());
      setMissions(unique);
    } catch (error) {
      console.error("Lỗi API:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const renderMission = ({ item }) => {
    const isPending = item.status === 'PENDING';
    const statusColor = isPending ? COLORS.accent : COLORS.blue;

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          {/* Header Card: Loại yêu cầu & Khoảng cách */}
          <View style={styles.cardHeader}>
            <View style={[styles.typeBadge, { backgroundColor: statusColor + '15' }]}>
              <Text style={[styles.typeText, { color: statusColor }]}>
                {item.requestType || 'RESCUE'}
              </Text>
            </View>
            <Text style={styles.distanceText}>
              {item.distanceKm ? `📍 ${item.distanceKm.toFixed(1)} km` : '📍 Đang tính...'}
            </Text>
          </View>

          {/* Địa chỉ & Mô tả (Thay cho lat/long) */}
          <Text style={styles.addressText} numberOfLines={1}>
            {item.description || 'Chưa có thông tin địa chỉ'}
          </Text>
          <Text style={styles.subDescription} numberOfLines={2}>
            Ghi chú: {item.assignmentReason || 'Cần hỗ trợ khẩn cấp tại hiện trường.'}
          </Text>

          {/* Footer Card: ID & Số người */}
          <View style={styles.footerRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>MÃ SỐ</Text>
              <Text style={styles.metaValue}>#{item.id}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>SỐ NGƯỜI</Text>
              <Text style={styles.metaValue}> {item.numberOfPeople}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>ƯU TIÊN</Text>
              <Text style={[styles.metaValue, { color: item.priorityLevel === 'CRITICAL' ? '#EF4444' : COLORS.textMain }]}>
                {item.priorityLevel}
              </Text>
            </View>
          </View>

          {/* Button hành động */}
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.actionBtn, { backgroundColor: isPending ? COLORS.accent : COLORS.blue }]}
            onPress={() => Alert.alert("Thông tin", `Đang điều phối đến nhiệm vụ #${item.id}`)}
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
          <Text style={styles.userIdText}>ID: {userId || '...'}</Text>
        </View>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          onPress={() => setFilter('WAITING')}
          style={[styles.tabItem, filter === 'WAITING' && styles.tabItemActive]}
        >
          <Text style={[styles.tabLabel, filter === 'WAITING' && styles.tabLabelActive]}>Mới nhất</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setFilter('DOING')}
          style={[styles.tabItem, filter === 'DOING' && styles.tabItemActive]}
        >
          <Text style={[styles.tabLabel, filter === 'DOING' && styles.tabLabelActive]}>Đang làm</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={missions.filter(m => filter === 'WAITING' ? m.status === 'PENDING' : m.status !== 'PENDING')}
          renderItem={renderMission}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
          ListEmptyComponent={<Text style={styles.emptyMsg}>Không có nhiệm vụ nào xử lý.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  topHeader: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 20, paddingBottom: 15,
    backgroundColor: COLORS.white
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: COLORS.textMain },
  userChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.green, marginRight: 6 },
  userIdText: { fontSize: 13, fontWeight: '700', color: COLORS.textSub },

  tabBar: { flexDirection: 'row', margin: 16, backgroundColor: '#E2E8F0', borderRadius: 12, padding: 4 },
  tabItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabItemActive: { backgroundColor: COLORS.white, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textSub },
  tabLabelActive: { color: COLORS.textMain },

  listContainer: { paddingHorizontal: 16, paddingBottom: 100 },
  card: { backgroundColor: COLORS.white, borderRadius: 20, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  cardContent: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeText: { fontSize: 12, fontWeight: '800' },
  distanceText: { fontSize: 13, fontWeight: '700', color: COLORS.textSub },
  
  addressText: { fontSize: 18, fontWeight: '700', color: COLORS.textMain, marginBottom: 4 },
  subDescription: { fontSize: 13, color: COLORS.textSub, lineHeight: 18, marginBottom: 16 },

  footerRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12, marginBottom: 16 },
  metaItem: { flex: 1 },
  metaLabel: { fontSize: 9, color: COLORS.textSub, fontWeight: '800', marginBottom: 2 },
  metaValue: { fontSize: 14, fontWeight: '700', color: COLORS.textMain },

  actionBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: COLORS.white, fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
  emptyMsg: { textAlign: 'center', marginTop: 100, color: COLORS.textSub }
});