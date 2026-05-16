import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { C } from '../src/constants/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your credentials.');
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={s.logoWrap}>
          <View style={s.logoBox}>
            <Text style={s.logoIcon}>🛡️</Text>
          </View>
          <Text style={s.appName}>StormShield</Text>
          <Text style={s.tagline}>Crisis-Response Professional</Text>
        </View>

        {/* Form */}
        <View style={s.form}>
          <Text style={s.label}>Email or Responder ID</Text>
          <View style={s.inputWrap}>
            <Text style={s.inputIcon}>👤</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. responder.8824@network.gov"
              placeholderTextColor={C.outline}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={s.row}>
            <Text style={s.label}>Security Credential</Text>
            <TouchableOpacity>
              <Text style={s.forgot}>Forgot Access?</Text>
            </TouchableOpacity>
          </View>
          <View style={s.inputWrap}>
            <Text style={s.inputIcon}>🔒</Text>
            <TextInput
              style={s.input}
              placeholder="Enter your secure password"
              placeholderTextColor={C.outline}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={s.authBtn} onPress={handleLogin} activeOpacity={0.85}>
            <Text style={s.authBtnText}>Authenticate  →</Text>
          </TouchableOpacity>

          <View style={s.registerRow}>
            <Text style={s.registerText}>Unregistered credential? </Text>
            <TouchableOpacity>
              <Text style={s.registerLink}>Request Access</Text>
            </TouchableOpacity>
          </View>

          <View style={s.notice}>
            <Text style={s.noticeIcon}>ℹ️</Text>
            <Text style={s.noticeText}>
              This is a restricted access portal for authorized personnel only. All activities are monitored and logged.
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
  logoBox: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: C.primary, alignItems: 'center',
    justifyContent: 'center', marginBottom: 16,
  },
  logoIcon: { fontSize: 36 },
  appName: { fontSize: 32, fontWeight: '900', color: C.primary, letterSpacing: -0.5 },
  tagline: { fontSize: 15, color: C.onSurfaceVariant, marginTop: 4 },
  form: { gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: C.onSurface, marginBottom: 6, marginTop: 8 },
  forgot: { fontSize: 14, fontWeight: '600', color: C.primary },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: C.outlineVariant,
    borderRadius: 12, paddingHorizontal: 14, height: 52,
    backgroundColor: C.surface,
  },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: C.onSurface },
  authBtn: {
    height: 52, borderRadius: 99, backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center', marginTop: 16,
  },
  authBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  registerText: { fontSize: 14, color: C.onSurfaceVariant },
  registerLink: { fontSize: 14, fontWeight: '700', color: C.primary },
  notice: {
    flexDirection: 'row', gap: 10, padding: 14,
    backgroundColor: C.surfaceContainer, borderRadius: 12,
    marginTop: 16, alignItems: 'flex-start',
  },
  noticeIcon: { fontSize: 16 },
  noticeText: { flex: 1, fontSize: 12, color: C.onSurfaceVariant, lineHeight: 18 },
});
