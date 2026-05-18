import { Tabs } from 'expo-router';
import { Platform, Text, View, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

const PRIMARY = '#041525';
const INACTIVE = '#94a3b8';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 64, paddingTop: 2 }}>
      <View style={{
        width: 20, height: 3, borderRadius: 2,
        backgroundColor: focused ? PRIMARY : 'transparent',
        marginBottom: 4,
      }} />
      <Text style={{ fontSize: 22, lineHeight: 24 }}>{emoji}</Text>
      <Text style={{
        fontSize: 10,
        fontWeight: focused ? '700' : '500',
        color: focused ? PRIMARY : INACTIVE,
        marginTop: 3,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
      }}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isUser = userRole?.includes('CITIZEN') || userRole?.includes('USER');
  const isRescue = userRole?.includes('RESCUE') || userRole?.includes('ADMIN');
  useEffect(() => {
    async function loadRole() {
      try {
        const role = await SecureStore.getItemAsync('userRole');
        console.log("DEBUG ROLE:", role); // Xem log ở terminal để biết role là gì
        setUserRole(role);
      } catch (e) {
        console.error("Lỗi load role:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadRole();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
        },
      }}
    >
      {/* GIAO DIỆN USER */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚠️" label="Alerts" focused={focused} />,
          href: (isUser ? '/' : null) as any
        }}
      />
      <Tabs.Screen
        name="shelters"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" label="Shelters" focused={focused} />,
          href: (isUser ? '/shelters' : null) as any
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="Report" focused={focused} />,
          href: (isUser ? '/report' : null) as any
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="suppport" focused={focused} />,
          href: (isUser ? '/support' : null) as any
        }}
      />

{/* TAB CHUNG: Luôn hiện */}
      <Tabs.Screen
        name="inbox"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔔" label="Inbox" focused={focused} />,
          href: (isUser ? '/inbox' : null) as any
        }}
      />
      {/* --- NHÓM TAB CHO RESCUE --- */}
      <Tabs.Screen name="RescueHome"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🚒" label="Home" focused={focused} />,
          href: (isRescue ? '/RescueHome' : null) as any
        }}
      />

      <Tabs.Screen
        name="rescue-map"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🚒" label="Missions" focused={focused} />,
          href: (isRescue ? '/rescue-map' : null) as any
        }}
      />

      <Tabs.Screen
        name="rescue-team"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🚒" label="Teamate" focused={focused} />,
          href: (isRescue ? '/rescue-team' : null) as any
        }}
      />



      

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} />,
          href: '/profile' as any
        }}
      />
    </Tabs>
  );
}