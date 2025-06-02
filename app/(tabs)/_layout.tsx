import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [user, loading]);

  if (loading) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'TODO',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              size={28} 
              name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'ダッシュボード',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              size={28} 
              name={focused ? 'stats-chart' : 'stats-chart-outline'} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'プロフィール',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              size={28} 
              name={focused ? 'person' : 'person-outline'} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
