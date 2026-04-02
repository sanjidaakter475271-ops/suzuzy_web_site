import { Tabs } from 'expo-router';
import { Home, Wrench, Clock, User, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs screenOptions={{
      tabBarStyle: {
        backgroundColor: COLORS.slate900,
        borderTopWidth: 1,
        borderTopColor: COLORS.slate800,
        height: 60 + (insets.bottom > 0 ? insets.bottom - 10 : 0),
        paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.slate500,
      headerShown: false,
      tabBarLabelStyle: {
        fontSize: TYPOGRAPHY.sizes.xxs,
        fontFamily: TYPOGRAPHY.families.bold,
      }
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color }) => <Wrench color={color} size={24} />
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Work',
          tabBarIcon: ({ color }) => <Clock color={color} size={24} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Me',
          tabBarIcon: ({ color }) => <User color={color} size={24} />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Set',
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />
        }}
      />
    </Tabs>
  );
}
