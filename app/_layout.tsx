// app/_layout.tsx
import { Stack } from 'expo-router';
import { GastosProvider } from '../context/gastosContext';

export default function RootLayout() {
  return (
    <GastosProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal',
            title: 'Nuevo Gasto',
            headerShown: true
          }} 
        />
      </Stack>
    </GastosProvider>
  );
}