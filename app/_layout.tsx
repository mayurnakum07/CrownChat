import { AuthGuard } from '@/components/AuthGuard';
import { FirebaseProvider } from '@/contexts/FirebaseContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { initializeGoogleSignIn } from '@/utils/firebase';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { LogBox } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  LogBox.ignoreAllLogs();
  
  // Initialize Google Sign-In
  useEffect(() => {
    initializeGoogleSignIn();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <FirebaseProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <ToastProvider>
          <AuthGuard>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="auth/login" options={{ headerShown: false }} />
              <Stack.Screen name="auth/register" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </AuthGuard>
        </ToastProvider>
        <StatusBar style="auto" />
      </ThemeProvider>
    </FirebaseProvider>
  );
}
