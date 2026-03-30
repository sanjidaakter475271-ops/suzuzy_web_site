import { Tabs } from 'expo-router';
import { Home, Wrench, Clock, User, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarStyle: {
        backgroundColor: '#0f172a',
        borderTopWidth: 0,
        height: 60,
        paddingBottom: 8,
      },
      tabBarActiveTintColor: '#3b82f6',
      tabBarInactiveTintColor: '#64748b',
      headerShown: false,
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: 'bold',
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
