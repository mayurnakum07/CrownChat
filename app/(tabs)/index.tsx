import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { Alert, Platform, StyleSheet, TouchableOpacity } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useFirebase } from '@/contexts/FirebaseContext';
import {
  checkAuthPersistence,
  debugAuthState,
  signOutUser
} from '@/utils/firebase';

export default function HomeScreen() {
  const { user, userData, loading, initialized, error } = useFirebase();

  // Debug utilities for development
  useEffect(() => {
    if (__DEV__ && initialized) {
      console.log('🔍 HomeScreen: Running debug utilities...');
      debugAuthState();
      checkAuthPersistence();
    }
  }, [initialized]);

  // Handle logout with confirmation
  const handleLogout = async (): Promise<void> => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await signOutUser();
              if (!result.success) {
                Alert.alert('Logout Failed', result.error || 'Unknown error');
              }
              // AuthGuard will automatically redirect to login
            } catch (error: any) {
              Alert.alert('Logout Failed', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      
      {/* Header Section */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to CrownChat!</ThemedText>
        <HelloWave />
      </ThemedView>
      
      {/* Debug Information (Development Only) */}
      {__DEV__ && (
        <ThemedView style={styles.debugContainer}>
          <ThemedText type="subtitle">Debug Information:</ThemedText>
          <ThemedText>User: {user ? '✅ Authenticated' : '❌ Not authenticated'}</ThemedText>
          <ThemedText>Loading: {loading ? '⏳ Loading' : '✅ Ready'}</ThemedText>
          <ThemedText>Initialized: {initialized ? '✅ Yes' : '❌ No'}</ThemedText>
          {error && <ThemedText style={styles.errorText}>Error: {error}</ThemedText>}
          {userData && (
            <ThemedText>Username: {userData.username}</ThemedText>
          )}
        </ThemedView>
      )}
      
      {/* User Information Section */}
      {user && (
        <ThemedView style={styles.userContainer}>
          {/* Profile Picture */}
          {(user.photoURL || userData?.profilePicture) && (
            <Image
              source={{ uri: user.photoURL || userData?.profilePicture }}
              style={styles.profilePicture}
            />
          )}
          
          {/* User Details */}
          <ThemedText type="subtitle">
            Hello, {user.displayName || userData?.displayName || user.email}!
          </ThemedText>
          <ThemedText>Email: {user.email}</ThemedText>
          {userData?.username && (
            <ThemedText>Username: @{userData.username}</ThemedText>
          )}
          
          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}
      
      {/* App Information Section */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  debugContainer: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  errorText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  userContainer: {
    gap: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
