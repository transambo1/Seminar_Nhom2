import { Tabs } from 'expo-router';
import { Platform, Text, View } from 'react-native';

const PRIMARY = '#041525';
const INACTIVE = '#94a3b8';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 64, paddingTop: 2 }}>
      {/* Active indicator dot above icon */}
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
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 0,
          elevation: 16,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: INACTIVE,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="⚠️" label="Alerts" focused={focused} /> }}
      />
      <Tabs.Screen
        name="shelters"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" label="Shelters" focused={focused} /> }}
      />
      <Tabs.Screen
        name="report"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="Report" focused={focused} /> }}
      />
      <Tabs.Screen
        name="support"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🆘" label="Support" focused={focused} /> }}
      />
      <Tabs.Screen
        name="inbox"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🔔" label="Inbox" focused={focused} /> }}
      />
    </Tabs>
  );
}
