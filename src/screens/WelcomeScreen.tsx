import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../constants/theme';

const WelcomeScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <LinearGradient
      colors={[theme.colors.gradient.start, theme.colors.gradient.end]}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenue{'\n'}sur Match</Text>
        <Text style={styles.subtitle}>
          Trouve en 30 secondes{'\n'}les meilleurs spots{'\n'}pour regarder tes matchs
        </Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Onboarding')}
        >
          <Text style={styles.buttonText}>Commencer</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fonts.sizes.xxxl,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: theme.fonts.sizes.lg,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
    lineHeight: 28,
  },
  button: {
    backgroundColor: theme.colors.text,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    minWidth: 200,
  },
  buttonText: {
    color: theme.colors.primary,
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default WelcomeScreen;
