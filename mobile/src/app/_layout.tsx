import { Slot } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Keep the splash screen visible while assets are loading or auth session is determined
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide the splash screen once the app is ready
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
