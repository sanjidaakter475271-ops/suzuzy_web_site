import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Wrench, Clock, User, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs 
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.tabBarBg,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 64 + (insets.bottom > 0 ? Math.max(insets.bottom - 10, 0) : 0),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textTertiary,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: TYPOGRAPHY.families.bold,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={22} />
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color }) => <Wrench color={color} size={22} />
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Work',
          tabBarIcon: ({ color }) => <Clock color={color} size={22} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User color={color} size={22} />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings color={color} size={22} />
        }}
      />
    </Tabs>
  );
}
