// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text } from 'react-native';

// Componente personalizado para los iconos
function TabBarIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 28 : 24, opacity: focused ? 1 : 0.7 }}>
      {name}
    </Text>
  );
}

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
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="🏠" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="balance"
        options={{
          title: 'Balance',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="💰" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="recibos"
        options={{
          title: 'Recibos',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="📸" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="reporte"
        options={{
          title: 'Reporte',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="📄" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}