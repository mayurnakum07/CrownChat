import { CommonButton } from '@/components/ui/CommonButton';
import { CommonInput } from '@/components/ui/CommonInput';
import { ImagePicker } from '@/components/ui/ImagePicker';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useToast } from '@/contexts/ToastContext';
import { RegisterFormData, useRegisterForm } from '@/hooks/useRegisterForm';
import { checkUsernameAvailability, signUp } from '@/utils/firebase';
import { handleFirebaseRegisterError } from '@/utils/formValidation';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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

// Suggested profile images - 20 diverse cartoon avatar options
const SUGGESTED_IMAGES = [
  // DiceBear Avataaars (PNG format for React Native compatibility)
  "https://api.dicebear.com/7.x/avataaars/png?seed=Felix&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=150",
  "https://api.dicebear.com/7.x/avataaars/png?seed=Aneka&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=150",
  "https://api.dicebear.com/7.x/avataaars/png?seed=Jasper&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=150",
  "https://api.dicebear.com/7.x/avataaars/png?seed=Lily&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=150",
  "https://api.dicebear.com/7.x/avataaars/png?seed=Max&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=150",

  // DiceBear Bottts (Robot avatars)
  "https://api.dicebear.com/7.x/bottts/png?seed=Buddy&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=150",
  "https://api.dicebear.com/7.x/bottts/png?seed=Spark&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=150",
  "https://api.dicebear.com/7.x/bottts/png?seed=Pixel&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=150",

  // DiceBear Fun Emoji (Fun cartoon characters)
  "https://api.dicebear.com/7.x/fun-emoji/png?seed=Happy&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=150",
  "https://api.dicebear.com/7.x/fun-emoji/png?seed=Sunny&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=150",
  "https://api.dicebear.com/7.x/fun-emoji/png?seed=Star&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=150",

  // More Avataaars with different features
  "https://api.dicebear.com/7.x/avataaars/png?seed=Zoe&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=150",
  "https://api.dicebear.com/7.x/avataaars/png?seed=Kai&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=150",
  "https://api.dicebear.com/7.x/avataaars/png?seed=Maya&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=150",
  "https://api.dicebear.com/7.x/avataaars/png?seed=Leo&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=150",
  "https://api.dicebear.com/7.x/avataaars/png?seed=Aria&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=150",

  // Additional Bottts
  "https://api.dicebear.com/7.x/bottts/png?seed=Neon&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=150",
  "https://api.dicebear.com/7.x/bottts/png?seed=Cyber&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=150",

  // More Fun Emojis
  "https://api.dicebear.com/7.x/fun-emoji/png?seed=Rainbow&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=150",
  "https://api.dicebear.com/7.x/fun-emoji/png?seed=Moon&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=150",
];

export default function RegisterScreen() {
  // Form state
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    setValue,
  } = useRegisterForm();

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

  // Username validation with debounce
  const checkUsername = useCallback(
    (value: string) => {
      if (value.length < 3) return;
      if (!/^[a-zA-Z0-9_]+$/.test(value)) return;

      setCheckingUsername(true);
      checkUsernameAvailability(value)
        .then((isAvailable) => {
          if (!isAvailable) {
            setError('username', { message: 'Username is already taken' });
          } else {
            clearErrors('username');
          }
        })
        .catch(() => {
          setError('username', { message: 'Failed to check username availability' });
        })
        .finally(() => {
          setCheckingUsername(false);
        });
    },
    [setError, clearErrors]
  );

  // Handle registration
  const handleRegister = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const result = await signUp({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        username: data.username,
        profilePicture: data.profilePicture || '',
      });

      if (result.success) {
        console.log('✅ Registration successful');
        showToast('success', 'Account created successfully! Welcome to CrownChat!');
        // AuthGuard will automatically redirect to main app
      } else {
        // Handle Firebase registration errors using utility function
        const errorMessage = handleFirebaseRegisterError(result.error, setError);
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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join CrownChat today</Text>
            </View>

            {/* Profile Picture Picker */}
            <Controller
              control={control}
              name="profilePicture"
              render={({ field: { onChange, value } }) => (
                <ImagePicker
                  selectedImage={value}
                  onImageSelect={onChange}
                  suggestedImages={SUGGESTED_IMAGES}
                />
              )}
            />

            {/* Registration Form */}
            <View style={styles.form}>
              {/* Username Input */}
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                  <CommonInput
                    label="Username"
                    placeholder="Enter username"
                    value={value}
                    onChangeText={(text) => {
                      onChange(text);
                      if (text.length >= 3) {
                        checkUsername(text);
                      }
                    }}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    autoCorrect={false}
                    error={errors.username?.message}
                    leftIcon={<Ionicons name="at" size={20} color="#007AFF" />}
                    rightIcon={
                      checkingUsername ? (
                        <ActivityIndicator size="small" color="#007AFF" />
                      ) : value && !errors.username ? (
                        <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                      ) : null
                    }
                    style={styles.input}
                  />
                )}
              />

              {/* Display Name Input */}
              <Controller
                control={control}
                name="displayName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <CommonInput
                    label="Display Name"
                    placeholder="Enter your full name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                    error={errors.displayName?.message}
                    leftIcon={<Ionicons name="person-outline" size={20} color="#007AFF" />}
                    style={styles.input}
                  />
                )}
              />

              {/* Email Input */}
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
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
                )}
              />

              {/* Password Input */}
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <CommonInput
                    label="Password"
                    placeholder="Enter password"
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
                )}
              />

              {/* Confirm Password Input */}
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <CommonInput
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showConfirmPassword}
                    error={errors.confirmPassword?.message}
                    leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#007AFF" />}
                    rightIcon={
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.eyeIcon}
                      >
                        <Ionicons
                          name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                          size={20}
                          color="#007AFF"
                        />
                      </TouchableOpacity>
                    }
                    style={styles.input}
                  />
                )}
              />

              {/* Register Button with Gradient */}
              <TouchableOpacity
                style={[
                  styles.gradientButton,
                  (!isFormValid || loading) && styles.disabledButton
                ]}
                onPress={handleSubmit(handleRegister as any)}
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
                      <Text style={styles.gradientButtonText}>Creating Account...</Text>
                    </View>
                  ) : (
                    <Text style={styles.gradientButtonText}>Create Account</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Sign Up Button */}
              <CommonButton
                title="Sign Up with Google"
                variant="outline"
                onPress={() => showToast('info', 'Google authentication will be available soon!')}
                disabled={true}
                leftIcon={<Ionicons name="logo-google" size={20} color="#007AFF" />}
                style={styles.googleButton}
              />

              {/* Login Link */}
              <CommonButton
                title="Already have an account? Sign in"
                variant="outline"
                size="small"
                onPress={() => router.push('/auth/login')}
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
    marginVertical: 30,
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
