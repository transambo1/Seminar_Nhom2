import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { C } from '../src/constants/colors';
import * as SecureStore from 'expo-secure-store'; 
import apiClient from '../src/api/apiClient';
import { authService } from '../src/api/authService';
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập email và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      // Gọi service đã lưu role vào SecureStore [cite: 98, 163]
      const userData = await authService.login(email, password);

      if (userData && userData.token) {
        // Dùng replace để không cho người dùng quay lại màn login bằng nút back [cite: 132]
        router.replace('/(tabs)');
      }
   } catch (error) {
  // 1. In toàn bộ object error ra Terminal máy tính để xem kĩ
  console.error("Chi tiết lỗi Đăng nhập:", error.response?.data || error.message || error);
  
  Alert.alert("Lỗi đăng nhập", error.toString());
} finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.logoWrap}>
          <Text style={s.appName}>StormShield</Text>
          <Text style={s.tagline}>Thiên tai cứu hộ khẩn cáp</Text>
        </View>

        <View style={s.form}>
          <Text style={s.label}>Email</Text>
          <View style={s.inputWrap}>
            <Text style={s.inputIcon}>👤</Text>
            <TextInput
              style={s.input}
              placeholder="responder@network.gov"
              placeholderTextColor={C.outline}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View style={s.row}>
            <Text style={s.label}>Security Credential</Text>
            <Text style={s.forgot}>Quên mật khẩu</Text>
          </View>
          <View style={s.inputWrap}>
            <Text style={s.inputIcon}>🔒</Text>
            <TextInput
              style={s.input}
              placeholder="Password"
              placeholderTextColor={C.outline}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[s.authBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.authBtnText}>Authenticate  →</Text>}
          </TouchableOpacity>

          <View style={s.notice}>
            <Text style={s.noticeIcon}>ℹ️</Text>
            <Text style={s.noticeText}>
              Bản ghi đăng nhập của responder {email || '...'} sẽ được lưu trữ phục vụ công tác điều hành cứu hộ.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.surfaceContainerLowest },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 40 },
  logoBox: { width: 80, height: 80, borderRadius: 24, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoIcon: { fontSize: 36 },
  appName: { fontSize: 32, fontWeight: '900', color: C.primary, letterSpacing: -0.5 },
  tagline: { fontSize: 15, color: C.onSurfaceVariant, marginTop: 4 },
  form: { gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 13, fontWeight: '700', color: C.onSurface, marginBottom: 4, textTransform: 'uppercase' },
  forgot: { fontSize: 13, fontWeight: '600', color: C.primary },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.outlineVariant, borderRadius: 14, paddingHorizontal: 16, height: 56, backgroundColor: C.surface },
  inputIcon: { fontSize: 18, marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: C.onSurface },
  authBtn: { height: 56, borderRadius: 16, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginTop: 16, elevation: 4 },
  authBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  notice: { flexDirection: 'row', gap: 10, padding: 16, backgroundColor: C.surfaceContainer, borderRadius: 16, marginTop: 20 },
  noticeIcon: { fontSize: 16 },
  noticeText: { flex: 1, fontSize: 12, color: C.onSurfaceVariant, lineHeight: 18 },
});