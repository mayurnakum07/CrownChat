import { CommonButton } from '@/components/ui/CommonButton';
import { CommonInput } from '@/components/ui/CommonInput';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useToast } from '@/contexts/ToastContext';
import { LoginFormData, useLoginForm } from '@/hooks/useLoginForm';
import { signIn, signInWithGoogle } from '@/utils/firebase';
import { handleFirebaseAuthError } from '@/utils/formValidation';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  // Form state
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Firebase context
  const { user } = useFirebase();
  const { showToast } = useToast();

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty, dirtyFields },
    watch,
    setError,
    clearErrors,
  } = useLoginForm();

  // Watch form values for real-time validation
  const watchedValues = watch();

  // Animation for loading spinner
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();
    } else {
      spinValue.setValue(0);
    }
  }, [loading, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Handle email login
  const handleEmailLogin = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const result = await signIn(data.email, data.password);

      if (result.success) {
        console.log('✅ Login successful');
        showToast('success', 'Login successful! Welcome back!');
        // AuthGuard will automatically redirect to main app
      } else {
        // Handle Firebase auth errors using utility function
        const errorMessage = handleFirebaseAuthError(result.error, setError);
        if (errorMessage) {
          showToast('error', errorMessage);
        }
      }
    } catch (error: any) {
      showToast('error', error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();

      if (result.success) {
        showToast('success', 'Google login successful!');
        router.replace('/(tabs)');
      } else {
        showToast('error', result.error || 'Google login failed');
      }
    } catch (error: any) {
      showToast('error', error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Check if form is valid
  const isFormValid = isValid && isDirty;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Main Content Container */}
          <View style={styles.contentContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="chatbubbles" size={60} color="#007AFF" />
              </View>
              <Text style={styles.title}>Welcome to CrownChat</Text>
              <Text style={styles.subtitle}>Sign in to continue your journey</Text>
            </View>

            {/* Login Form */}
            <View style={styles.form}>
              {/* Email Input */}
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <CommonInput
                      label="Email"
                      placeholder="Enter your email address"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      error={errors.email?.message}
                      leftIcon={<Ionicons name="mail-outline" size={20} color="#007AFF" />}
                      style={styles.input}
                    />

                  </View>
                )}
              />

              {/* Password Input */}
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <CommonInput
                      label="Password"
                      placeholder="Enter your password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                      error={errors.password?.message}
                      leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#007AFF" />}
                      rightIcon={
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          style={styles.eyeIcon}
                        >
                          <Ionicons
                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color="#007AFF"
                          />
                        </TouchableOpacity>
                      }
                      style={styles.input}
                    />
                  </View>
                )}
              />

              {/* Login Button with Gradient */}
              <TouchableOpacity
                style={[
                  styles.gradientButton,
                  (!isFormValid || loading) && styles.disabledButton
                ]}
                onPress={handleSubmit(handleEmailLogin)}
                disabled={!isFormValid || loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#007AFF', '#5856D6', '#FF2D92']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradient}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={styles.gradientButtonText}>Signing In...</Text>
                    </View>
                  ) : (
                    <Text style={styles.gradientButtonText}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Login Button */}
              <CommonButton
                title="Sign In with Google"
                variant="outline"
                onPress={() => showToast('info', 'Google authentication will be available soon!')}
                disabled={true}
                leftIcon={<Ionicons name="logo-google" size={20} color="#007AFF" />}
                style={styles.googleButton}
              />

              {/* Register Link */}
              <CommonButton
                title="Don't have an account? Sign up"
                variant="outline"
                size="small"
                onPress={() => router.push('/auth/register')}
                style={styles.linkButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    minHeight: height,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: Math.min(width * 0.08, 32),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: Math.min(width * 0.04, 16),
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
  },
  gradientButton: {
    borderRadius: 30,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  disabledButton: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 20,
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  googleButton: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  linkButton: {
    marginTop: 10,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  eyeIcon: {
    padding: 5,
  },
});
