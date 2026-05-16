import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import * as SecureStore from 'expo-secure-store'; // 🟢 Dùng SecureStore thay vì AsyncStorage
import { router } from 'expo-router';
import { C } from '../../src/constants/colors';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // 🟢 Lấy string JSON từ SecureStore
        const profileStr = await SecureStore.getItemAsync('userProfile');
        if (profileStr) {
          const profileData = JSON.parse(profileStr);
          // profileData lúc này chính là AuthResponse (có userId, user: {fullName, phone...})
          // Theo cấu trúc AuthResponse.java bạn gửi
          setUser(profileData);
        }
      } catch (e) {
        console.error("Lỗi đọc SecureStore:", e);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userProfile');
    router.replace('/login');
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={C.primary} />;

  // Nếu chưa login thì hiện thông tin của Thành để demo
  const displayUser = user?.user || {
    fullName: 'Trần Lâm Thành',
    email: 'thanh.tran@student.sgu.edu.vn',
    phone: 'Chưa cập nhật'
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView>
        <View style={s.header}>
          <View style={s.avatar}><Text style={s.avatarTxt}>T</Text></View>
          <Text style={s.name}>{displayUser.fullName}</Text>
          <Text style={s.role}>{user?.role || 'USER'}</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Thông tin liên hệ</Text>
          <View style={s.infoRow}>
            <Text style={s.label}>Email</Text>
            <Text style={s.value}>{displayUser.email}</Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.label}>Số điện thoại</Text>
            {/* Dùng .phone vì @JsonProperty("phone") */}
            <Text style={s.value}>{displayUser.phone || 'N/A'}</Text>
          </View>
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Text style={s.logoutTxt}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: { alignItems: 'center', padding: 30, backgroundColor: C.surfaceContainerLowest, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarTxt: { color: '#fff', fontSize: 30, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: '800', color: C.onSurface },
  role: { fontSize: 14, color: C.primary, fontWeight: '600' },
  card: { margin: 20, padding: 15, backgroundColor: C.surface, borderRadius: 20, borderWidth: 1, borderColor: C.outlineVariant },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 15, color: C.onSurfaceVariant },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.outlineVariant },
  label: { color: C.onSurfaceVariant },
  value: { fontWeight: '700', color: C.onSurface },
  logoutBtn: { marginHorizontal: 20, height: 50, backgroundColor: '#FEE2E2', borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FCA5A5' },
  logoutTxt: { color: '#B91C1C', fontWeight: '800' }
});