import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ImageBackground, Image, Dimensions } from 'react-native';
import { theme, images } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Start pulse animation after initial animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  return (
    <ImageBackground
      source={images.background}
      style={styles.container}
      resizeMode="cover"
    >
      <Animated.View
        style={[
          styles.content,
          {
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) }
            ],
            opacity: opacityAnim,
          },
        ]}
      >
        <Image
          source={images.logo}
          style={styles.logo}
          resizeMode="contain"
        />
        <Animated.Text style={styles.title}>MATCH</Animated.Text>
        <Animated.Text style={styles.subtitle}>
          Les meilleurs plans matchs{'\n'}qui vont laisseront sans voix
        </Animated.Text>
      </Animated.View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: theme.fonts.sizes.xxxl,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: theme.colors.secondary,
    marginBottom: 24,
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: theme.fonts.sizes.lg,
    fontStyle: 'italic',
    color: theme.colors.secondary,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 26,
  },
});

export default SplashScreen;
