import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../screens/ThemeContext';

export default function TabLayout() {
  const { theme, isDarkMode } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDarkMode ? '#a78bfa' : '#2E7D32',
        tabBarInactiveTintColor: isDarkMode ? 'rgba(255,255,255,0.6)' : '#666',
        tabBarStyle: {
          backgroundColor: isDarkMode ? theme.cardBackground : '#fff',
          elevation: 10,
          shadowColor: isDarkMode ? '#a78bfa' : '#10b981',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          shadowRadius: 4,
          borderTopColor: isDarkMode ? theme.border : 'transparent',
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fitness" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="nutrition" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
