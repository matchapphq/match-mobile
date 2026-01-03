import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme, images } from '../constants/theme';

const WelcomeScreen = () => {
  const navigation = useNavigation<any>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ImageBackground
      source={images.background}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.content}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text style={styles.title}>Bienvenue{'\n'}sur Match</Text>
          <Text style={styles.subtitle}>
            Trouve en 30 secondes{'\n'}les meilleurs spots{'\n'}pour regarder tes matchs
          </Text>
        </Animated.View>
        
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Onboarding')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Commencer</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: theme.fonts.sizes.lg,
    fontStyle: 'italic',
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl * 1.5,
    lineHeight: 28,
    opacity: 0.95,
  },
  button: {
    backgroundColor: theme.colors.text,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.md + 4,
    borderRadius: theme.borderRadius.full,
    minWidth: 220,
    ...theme.shadows.medium,
  },
  buttonText: {
    color: theme.colors.primary,
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default WelcomeScreen;
