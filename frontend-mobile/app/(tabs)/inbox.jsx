import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
  ActivityIndicator, RefreshControl, Platform
} from 'react-native';

import apiClient from '../../src/api/apiClient';
import * as SecureStore from 'expo-secure-store';

// 🟢 Bảng màu đồng bộ với RescueHome
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

export default function InboxScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);

  const fetchNotifications = async () => {
    try {
      const profileStr = await SecureStore.getItemAsync('userProfile');
      const profile = profileStr ? JSON.parse(profileStr) : { userId: 1 };
      const currentId = profile.userId;
      setUserId(currentId);

      /**
       * 🟢 Khớp với NotificationController.java: Sử dụng @RequestParam Long userId
       */
      const response = await apiClient.get('/api/v1/notifications/my', {
        params: { userId: currentId } 
      });

      if (response.data) {
        const sortedData = response.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications(sortedData);
      }
    } catch (error) {
      console.error("Lỗi Fetch Inbox:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      /**
       * 🟢 Khớp với PatchMapping("/{id}/read")
       */
      await apiClient.patch(`/api/v1/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, status: 'READ' } : n)
      );
    } catch (e) { console.warn("Không thể đánh dấu đọc:", e); }
  };

  const getNotifConfig = (type) => {
    switch (type) {
      case 'NEARBY_ALERT': return { label: 'CẢNH BÁO', color: COLORS.accent, icon: '⚠️' };
      case 'SUPPORT_STATUS_UPDATED': return { label: 'CẬP NHẬT', color: COLORS.blue, icon: '🚑' };
      case 'INCIDENT_REPORT_APPROVED': return { label: 'DUYỆT', color: COLORS.green, icon: '✅' };
      case 'RESCUE_REQUEST_ASSIGNED': return { label: 'PHÂN CÔNG', color: COLORS.primary, icon: '🚁' };
      default: return { label: 'THÔNG BÁO', color: COLORS.textSub, icon: '🔔' };
    }
  };

  if (loading && !refreshing) return <ActivityIndicator style={{ flex: 1 }} color={COLORS.accent} />;

  return (
    <SafeAreaView style={styles.container}>
      {/* 🟢 Header đồng bộ phong cách RescueHome */}
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <View style={styles.userChip}>
          <View style={styles.onlineDot} />
          <Text style={styles.userIdText}>ID: {userId || '...'}</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyMsg}>Hộp thư đang trống</Text>
          </View>
        ) : (
          notifications.map((n) => {
            const config = getNotifConfig(n.type);
            const isRead = n.status === 'READ';
            
            return (
              <TouchableOpacity 
                key={n.id} 
                activeOpacity={0.8}
                style={[styles.card, isRead && { opacity: 0.6 }]} 
                onPress={() => markAsRead(n.id)}
              >
                <View style={styles.cardContent}>
                  {/* Header Card: Loại thông báo & Thời gian */}
                  <View style={styles.cardHeader}>
                    <View style={[styles.typeBadge, { backgroundColor: config.color + '15' }]}>
                      <Text style={[styles.typeText, { color: config.color }]}>
                        {config.icon} {config.label}
                      </Text>
                    </View>
                    {!isRead && <View style={styles.unreadDot} />}
                    <Text style={styles.timeText}>
                      {new Date(n.createdAt).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>

                  {/* Nội dung thông báo */}
                  <Text style={[styles.titleText, !isRead && { fontWeight: '800' }]} numberOfLines={1}>
                    {n.title}
                  </Text>
                  <Text style={styles.subDescription} numberOfLines={3}>
                    {n.message}
                  </Text>

                  {/* Footer Card: ID & Trạng thái */}
                  <View style={styles.footerRow}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>MÃ SỐ</Text>
                      <Text style={styles.metaValue}>#{n.id}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>TRẠNG THÁI</Text>
                      <Text style={[styles.metaValue, { color: isRead ? COLORS.textSub : COLORS.blue }]}>
                        {isRead ? 'ĐÃ ĐỌC' : 'MỚI'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  topHeader: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 20 : 40, paddingBottom: 15,
    backgroundColor: COLORS.white
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: COLORS.textMain },
  userChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.green, marginRight: 6 },
  userIdText: { fontSize: 13, fontWeight: '700', color: COLORS.textSub },

  listContainer: { paddingHorizontal: 16, paddingTop: 16 },
  card: { 
    backgroundColor: COLORS.white, borderRadius: 20, marginBottom: 16, 
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 
  },
  cardContent: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeText: { fontSize: 11, fontWeight: '800' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.blue, marginLeft: 'auto', marginRight: 10 },
  timeText: { fontSize: 12, fontWeight: '700', color: COLORS.textSub },
  
  titleText: { fontSize: 18, fontWeight: '700', color: COLORS.textMain, marginBottom: 4 },
  subDescription: { fontSize: 14, color: COLORS.textSub, lineHeight: 20, marginBottom: 16 },

  footerRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  metaItem: { flex: 1 },
  metaLabel: { fontSize: 9, color: COLORS.textSub, fontWeight: '800', marginBottom: 2 },
  metaValue: { fontSize: 13, fontWeight: '700', color: COLORS.textMain },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyIcon: { fontSize: 60, marginBottom: 10 },
  emptyMsg: { textAlign: 'center', color: COLORS.textSub, fontSize: 16, fontWeight: '700' }
});