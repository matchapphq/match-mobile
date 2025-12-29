import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';

const SplashScreen = () => {
  const scaleAnim = new Animated.Value(0.5);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={[theme.colors.gradient.start, theme.colors.gradient.end]}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={styles.logo}>
          <Animated.Text style={styles.lightning}>⚡</Animated.Text>
        </View>
        <Animated.Text style={styles.title}>MATCH</Animated.Text>
        <Animated.Text style={styles.subtitle}>
          Les meilleurs plans matchs{'\n'}qui vont laisseront sans voix
        </Animated.Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  lightning: {
    fontSize: 80,
    color: theme.colors.secondary,
  },
  title: {
    fontSize: theme.fonts.sizes.xxxl,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    marginBottom: 20,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.secondary,
    textAlign: 'center',
    paddingHorizontal: 40,
    opacity: 0.9,
  },
});

export default SplashScreen;
