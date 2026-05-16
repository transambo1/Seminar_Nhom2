import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { C } from '../../src/constants/colors';

const NOTIFICATIONS = [
  {
    id: '1', read: false, icon: '⚠️', title: 'Flash Flood Warning Expanded',
    desc: 'Sector 7 has been added to the critical evacuation zone. Water levels are rising rapidly near the riverfront.',
    time: 'Just now', timeColor: C.error, borderColor: C.error,
    iconBg: C.errorContainer, dot: C.error,
  },
  {
    id: '2', read: false, icon: '🎧', title: 'Rescue Request Update',
    desc: 'Unit Alpha-4 has been dispatched to your reported location. Estimated time of arrival is 15 minutes.',
    time: '12 min ago', timeColor: C.onSurfaceVariant, borderColor: C.primary,
    iconBg: C.primaryFixed, dot: C.primary,
  },
  {
    id: '3', read: false, icon: '📍', title: 'Road Closure Nearby',
    desc: 'Highway 9 south of the interchange is closed due to fallen debris. Traffic is being rerouted.',
    time: '45 min ago', timeColor: C.onSurfaceVariant, borderColor: C.tertiaryFixedDim,
    iconBg: C.tertiaryFixed, dot: C.tertiaryFixedDim,
  },
];

const OLD_NOTIFICATIONS = [
  {
    id: '4', read: true, icon: 'ℹ️', title: 'Shelter Capacity Reached',
    desc: 'The Central High School emergency shelter is currently at full capacity.',
    time: '2:30 PM', iconBg: C.surfaceVariant,
  },
  {
    id: '5', read: true, icon: '✅', title: 'System Maintenance Complete',
    desc: 'All communication arrays have been restored to full functionality.',
    time: '11:00 AM', iconBg: C.surfaceVariant,
  },
];

export default function InboxScreen() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const markAllRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })));
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <TouchableOpacity><Text style={s.menuIcon}>☰</Text></TouchableOpacity>
        <Text style={s.brand}>STORMSHIELD</Text>
        <View style={s.avatarWrap}><Text style={s.avatarTxt}>👤</Text></View>
      </View>
      <ScrollView style={s.scroll}>
        {/* Page Header */}
        <View style={s.pageHeader}>
          <View style={s.titleRow}>
            <Text style={s.pageTitle}>Inbox</Text>
            {unreadCount > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeTxt}>{unreadCount} New</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={s.markAllBtn} onPress={markAllRead}>
            <Text style={s.markAllTxt}>✓✓  Mark all as read</Text>
          </TouchableOpacity>
        </View>

        {/* Unread Notifications */}
        {notifications.map(n => (
          <TouchableOpacity key={n.id} style={s.notifCard} activeOpacity={0.8}>
            <View style={[s.notifBorder, { backgroundColor: n.borderColor }]} />
            <View style={[s.notifIcon, { backgroundColor: n.iconBg }]}>
              <Text style={{ fontSize: 20 }}>{n.icon}</Text>
            </View>
            <View style={s.notifBody}>
              <View style={s.notifRow}>
                <Text style={s.notifTitle} numberOfLines={1}>{n.title}</Text>
                <Text style={[s.notifTime, { color: n.timeColor }]}>{n.time}</Text>
              </View>
              <Text style={s.notifDesc} numberOfLines={2}>{n.desc}</Text>
            </View>
            {!n.read && (
              <View style={s.unreadDot}>
                <View style={[s.dot, { backgroundColor: n.dot }]} />
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Divider */}
        <View style={s.divider}>
          <View style={s.divLine} />
          <Text style={s.divLabel}>YESTERDAY</Text>
          <View style={s.divLine} />
        </View>

        {/* Read Notifications */}
        {OLD_NOTIFICATIONS.map(n => (
          <TouchableOpacity key={n.id} style={[s.notifCard, s.notifRead]} activeOpacity={0.8}>
            <View style={s.notifReadBorder} />
            <View style={[s.notifIcon, { backgroundColor: n.iconBg }]}>
              <Text style={{ fontSize: 20 }}>{n.icon}</Text>
            </View>
            <View style={s.notifBody}>
              <View style={s.notifRow}>
                <Text style={s.notifTitle} numberOfLines={1}>{n.title}</Text>
                <Text style={s.notifTime}>{n.time}</Text>
              </View>
              <Text style={s.notifDesc} numberOfLines={2}>{n.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.surfaceContainerLowest,
    borderBottomWidth: 1, borderBottomColor: C.outlineVariant,
  },
  menuIcon: { fontSize: 22 },
  brand: { fontSize: 15, fontWeight: '900', color: C.primary, letterSpacing: 2 },
  avatarWrap: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: C.surfaceVariant, alignItems: 'center', justifyContent: 'center',
  },
  avatarTxt: { fontSize: 18 },
  scroll: { flex: 1 },
  pageHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pageTitle: { fontSize: 30, fontWeight: '900', color: C.onSurface },
  badge: {
    backgroundColor: C.secondary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99,
  },
  badgeTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  markAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.primaryFixed, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
  },
  markAllTxt: { fontSize: 13, fontWeight: '600', color: C.primary },
  notifCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 16, borderWidth: 1, borderColor: C.outlineVariant,
    overflow: 'hidden', padding: 14, gap: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  notifRead: { opacity: 0.75, backgroundColor: C.surfaceContainer },
  notifBorder: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  notifReadBorder: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, backgroundColor: C.outlineVariant },
  notifIcon: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  notifBody: { flex: 1 },
  notifRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: C.onSurface, flex: 1 },
  notifTime: { fontSize: 12, fontWeight: '500', color: C.onSurfaceVariant, marginLeft: 6 },
  notifDesc: { fontSize: 13, color: C.onSurfaceVariant, lineHeight: 18 },
  unreadDot: { width: 16, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  divider: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  divLine: { flex: 1, height: 1, backgroundColor: C.outlineVariant, opacity: 0.5 },
  divLabel: { fontSize: 11, fontWeight: '700', color: C.onSurfaceVariant, letterSpacing: 1 },
});
