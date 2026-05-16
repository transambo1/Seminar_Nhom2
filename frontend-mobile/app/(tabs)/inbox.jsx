import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
  ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../src/api/apiClient';
import { C } from '../../src/constants/colors';
import * as SecureStore from 'expo-secure-store';
export default function InboxScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🟢 Hàm lấy dữ liệu thật từ Backend
  const fetchNotifications = async () => {
    try {
    const profileStr = await SecureStore.getItemAsync('userProfile');
const profile = JSON.parse(profileStr);
const userId = profile.userId; // Fallback về 1 để test nếu chưa login

      // Gọi đúng API trả về List<NotificationResponse>
      const response = await apiClient.get('/api/v1/notifications/my', {
        params: { userId: userId }
      });

      // Sắp xếp thông báo mới nhất lên đầu
      const sortedData = response.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setNotifications(sortedData);
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

  // 🟢 Hàm đánh dấu đã đọc
  const markAsRead = async (id) => {
    try {
      await apiClient.patch(`/api/v1/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, status: 'READ' } : n)
      );
    } catch (e) { console.warn(e); }
  };

  // 🟢 Ánh xạ Icon & Màu dựa trên Enum NotificationType
  const getStyle = (type) => {
    switch (type) {
      case 'NEARBY_ALERT': 
        return { icon: '⚠️', color: C.error, bg: C.errorContainer };
      case 'SUPPORT_STATUS_UPDATED': 
        return { icon: '🚑', color: C.primary, bg: C.primaryFixed };
      case 'INCIDENT_REPORT_APPROVED': 
        return { icon: '✅', color: '#16a34a', bg: '#DCFCE7' };
      case 'INCIDENT_REPORT_REJECTED': 
        return { icon: '❌', color: C.error, bg: C.errorContainer };
      case 'RESCUE_REQUEST_ASSIGNED': 
        return { icon: '🚁', color: C.secondary, bg: C.secondaryContainer };
      default: 
        return { icon: '🔔', color: C.onSurfaceVariant, bg: C.surfaceVariant };
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={C.primary} />;

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Text style={s.pageTitle}>Inbox</Text>
        {notifications.filter(n => n.status === 'UNREAD').length > 0 && (
          <View style={s.badge}>
            <Text style={s.badgeTxt}>{notifications.filter(n => n.status === 'UNREAD').length} Mới</Text>
          </View>
        )}
      </View>

      <ScrollView 
        style={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchNotifications();}} />}
      >
        {notifications.length === 0 ? (
          <View style={s.empty}>
            <Text style={{fontSize: 50}}>📭</Text>
            <Text style={s.emptyTxt}>Không có thông báo nào</Text>
          </View>
        ) : (
          notifications.map((n) => {
            const style = getStyle(n.type);
            const isRead = n.status === 'READ';
            
            return (
              <TouchableOpacity 
                key={n.id} 
                style={[s.notifCard, isRead && s.notifRead]} 
                onPress={() => markAsRead(n.id)}
                activeOpacity={0.7}
              >
                {!isRead && <View style={[s.sideBorder, { backgroundColor: style.color }]} />}
                <View style={[s.iconBox, { backgroundColor: style.bg }]}>
                  <Text style={{ fontSize: 20 }}>{style.icon}</Text>
                </View>
                <View style={s.body}>
                  <View style={s.row}>
                    <Text style={[s.title, !isRead && { fontWeight: '800' }]} numberOfLines={1}>{n.title}</Text>
                    <Text style={s.time}>{new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                  </View>
                  <Text style={s.desc} numberOfLines={2}>{n.message}</Text>
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

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 10 },
  pageTitle: { fontSize: 32, fontWeight: '900', color: C.onSurface },
  badge: { backgroundColor: C.error, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgeTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  scroll: { flex: 1 },
  notifCard: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12,
    backgroundColor: C.surfaceContainerLowest, borderRadius: 20, padding: 16, gap: 14,
    borderWidth: 1, borderColor: C.outlineVariant, elevation: 2, overflow: 'hidden'
  },
  notifRead: { opacity: 0.6, backgroundColor: 'transparent', elevation: 0 },
  sideBorder: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 6 },
  iconBox: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontSize: 15, color: C.onSurface, flex: 1, marginRight: 8 },
  time: { fontSize: 11, color: C.outline, fontWeight: '600' },
  desc: { fontSize: 13, color: C.onSurfaceVariant, lineHeight: 18 },
  empty: { alignItems: 'center', marginTop: 100, gap: 10 },
  emptyTxt: { color: C.outline, fontSize: 16, fontWeight: '600' }
});