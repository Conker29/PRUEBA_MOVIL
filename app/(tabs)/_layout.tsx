// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="🏠" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="balance"
        options={{
          title: 'Balance',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="💰" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="recibos"
        options={{
          title: 'Recibos',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="📸" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="reporte"
        options={{
          title: 'Reporte',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="📄" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

// Componente personalizado para los iconos
function TabBarIcon({ name, color, focused }: { name: string; color: string; focused: boolean }) {
  return (
    <span
      style={{
        fontSize: focused ? 28 : 24,
        opacity: focused ? 1 : 0.7,
        transition: 'all 0.2s ease',
      }}
    >
      {name}
    </span>
  );
}