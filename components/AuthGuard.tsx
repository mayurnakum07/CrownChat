import { useFirebase } from '@/contexts/FirebaseContext';
import { router, useSegments } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AnimatedSplashScreen } from './AnimatedSplashScreen';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading, initialized } = useFirebase();
  const segments = useSegments();
  const [isInitializing, setIsInitializing] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [hasNavigated, setHasNavigated] = useState(false);
  
  // Refs to prevent multiple navigations
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAuthStateRef = useRef<{ user: any; isAuthGroup: boolean } | null>(null);

  // Calculate authentication state at the top level
  const isAuthenticated = !!user;
  const isAuthGroup = segments[0] === 'auth';

  useEffect(() => {
    // Show splash for at least 3 seconds
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    // Hide splash when Firebase auth is ready
    if (!loading && initialized) {
      setTimeout(() => {
        setIsInitializing(false);
      }, 500); // Small delay to ensure smooth transition
    }

    return () => {
      clearTimeout(splashTimer);
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [loading, initialized]);

  useEffect(() => {
    // Prevent navigation if still loading or initializing
    if (loading || !initialized || isInitializing || showSplash) {
      return;
    }

    // Check if auth state has actually changed
    const currentAuthState = { user: isAuthenticated, isAuthGroup };
    const lastAuthState = lastAuthStateRef.current;
    
    if (lastAuthState && 
        lastAuthState.user === currentAuthState.user && 
        lastAuthState.isAuthGroup === currentAuthState.isAuthGroup) {
      return; // No change, don't navigate
    }

    // Update last auth state
    lastAuthStateRef.current = currentAuthState;

    // Clear any existing navigation timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    // Set navigation timeout to prevent rapid navigation
    navigationTimeoutRef.current = setTimeout(() => {
      if (isAuthenticated && isAuthGroup) {
        // User is logged in but on auth screen, redirect to main app
        console.log('🔄 AuthGuard: Redirecting authenticated user to main app');
        router.replace('/(tabs)');
      } else if (!isAuthenticated && !isAuthGroup) {
        // User is not logged in but on main app, redirect to login
        console.log('🔄 AuthGuard: Redirecting unauthenticated user to login');
        router.replace('/auth/login');
      }
      setHasNavigated(true);
    }, 100); // Small delay to prevent rapid navigation

  }, [isAuthenticated, isAuthGroup, loading, initialized, isInitializing, showSplash]);

  // Show animated splash screen during initialization
  if (showSplash || isInitializing) {
    return <AnimatedSplashScreen />;
  }

  // Show loading indicator if still loading after splash
  if (loading || !initialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});
