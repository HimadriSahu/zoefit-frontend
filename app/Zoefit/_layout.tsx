import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
        {/* <Tabs.Screen
        name="welcomePage"
        options={{
          title: 'welcomePage',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles" size={size} color={color} />
          ),
          headerShown: false,
          // headerTitle: 'ZoeFit',
        }}
      /> */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          headerShown: false,
          // headerTitle: 'ZoeFit',
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
          // headerTitle: 'ZoeFit',
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
          // headerTitle: 'ZoeFit',
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
          // headerTitle: 'ZoeFit',
        }}
      />
      {/* <Tabs.Screen
        name="personalizing"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="birthday"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="dinner-time"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="gender"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="height"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="weight"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="goal"
        options={{
          href: null,
          headerShown: false,
        }}
      /> */}
    </Tabs>
  );
}
