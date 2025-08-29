import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Drop message component
const DropMessage: React.FC<{ 
  message: string; 
  delay: number; 
  position: { x: number; y: number }; 
  opacity: Animated.Value;
  translateY: Animated.Value;
}> = ({ message, delay, position, opacity, translateY }) => {
  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(2000),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -50,
          duration: 500,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    const loopAnimation = Animated.loop(animation);
    loopAnimation.start();

    return () => loopAnimation.stop();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.dropMessage,
        {
          left: position.x,
          top: position.y,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={styles.dropMessageText}>{message}</Text>
    </Animated.View>
  );
};

export const AnimatedSplashScreen: React.FC = () => {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Create animated values for drop messages
  const dropMessages = [
    { message: "Hello!", delay: 0, position: { x: width * 0.1, y: height * 0.2 } },
    { message: "Welcome!", delay: 500, position: { x: width * 0.8, y: height * 0.3 } },
    { message: "Chat away!", delay: 1000, position: { x: width * 0.2, y: height * 0.7 } },
    { message: "Connect!", delay: 1500, position: { x: width * 0.7, y: height * 0.8 } },
    { message: "Share!", delay: 2000, position: { x: width * 0.15, y: height * 0.4 } },
    { message: "Have fun!", delay: 2500, position: { x: width * 0.75, y: height * 0.6 } },
  ].map((msg, index) => ({
    ...msg,
    opacity: useRef(new Animated.Value(0)).current,
    translateY: useRef(new Animated.Value(50)).current,
  }));

  useEffect(() => {
    // Initial logo animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 500,
          easing: Easing.elastic(1.2),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // Text animation after logo
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Start pulse after initial animation
    setTimeout(() => {
      pulseAnimation.start();
    }, 1300);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#007AFF', '#5856D6', '#FF2D92']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Drop Messages Background */}
        {dropMessages.map((msg, index) => (
          <DropMessage
            key={index}
            message={msg.message}
            delay={msg.delay}
            position={msg.position}
            opacity={msg.opacity}
            translateY={msg.translateY}
          />
        ))}

        <View style={styles.content}>
          {/* Logo Container */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: logoScale },
                  { scale: pulseAnim },
                ],
              },
            ]}
          >
            <View style={styles.logoBackground}>
              <Ionicons name="chatbubbles" size={80} color="#fff" />
            </View>
          </Animated.View>

          {/* App Name */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textOpacity,
                transform: [{ translateY: textTranslateY }],
              },
            ]}
          >
            <Text style={styles.appName}>CrownChat</Text>
            <Text style={styles.tagline}>Connect • Share • Chat</Text>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    letterSpacing: 1,
    fontWeight: '500',
  },
  dropMessage: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dropMessageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
