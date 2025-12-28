import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../constants/theme';
import { useStore } from '../store/useStore';

type OnboardingStep = 'sports' | 'ambiance' | 'food' | 'budget';

const OnboardingScreen = () => {
  const navigation = useNavigation<any>();
  const { updateUserPreferences, setOnboardingCompleted } = useStore();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('sports');
  const [selections, setSelections] = useState({
    sports: [] as string[],
    ambiance: [] as string[],
    foodTypes: [] as string[],
    budget: '' as string,
  });

  const sportsOptions = [
    { id: 'foot', label: 'Foot', icon: '⚽' },
    { id: 'rugby', label: 'Rugby', icon: '🏉' },
    { id: 'basket', label: 'Basket', icon: '🏀' },
    { id: 'tennis', label: 'Tennis', icon: '🎾' },
  ];

  const ambianceOptions = [
    { id: 'posee', label: 'Posée', icon: '😌' },
    { id: 'chaude', label: 'Ultra / Ambiance chaude', icon: '🔥' },
    { id: 'conviviale', label: 'Conviviale', icon: '🤗' },
  ];

  const foodOptions = [
    { id: 'restaurant', label: 'Restaurant', icon: '🍴' },
    { id: 'bar', label: 'Bars / Pubs', icon: '🍺' },
    { id: 'fastfood', label: 'Fast-foods', icon: '🍔' },
  ];

  const budgetOptions = [
    { id: '5-10', label: '5-10 €' },
    { id: '10-20', label: '10-20 €' },
    { id: '+20', label: '+20 €' },
  ];

  const toggleSelection = (category: 'sports' | 'ambiance' | 'foodTypes', item: string) => {
    setSelections(prev => ({
      ...prev,
      [category]: prev[category].includes(item)
        ? prev[category].filter(i => i !== item)
        : [...prev[category], item]
    }));
  };

  const selectBudget = (budget: string) => {
    setSelections(prev => ({ ...prev, budget }));
  };

  const handleContinue = () => {
    switch (currentStep) {
      case 'sports':
        setCurrentStep('ambiance');
        break;
      case 'ambiance':
        setCurrentStep('food');
        break;
      case 'food':
        setCurrentStep('budget');
        break;
      case 'budget':
        completeOnboarding();
        break;
    }
  };

  const completeOnboarding = async () => {
    updateUserPreferences({
      sports: selections.sports,
      ambiance: selections.ambiance,
      foodTypes: selections.foodTypes,
      budget: selections.budget,
    });
    await setOnboardingCompleted(true);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const renderSportsStep = () => (
    <>
      <Text style={styles.title}>Quels sports t'intéressent ?</Text>
      <Text style={styles.subtitle}>Sélectionne 1 ou plusieurs</Text>
      <View style={styles.optionsContainer}>
        {sportsOptions.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              selections.sports.includes(option.id) && styles.optionButtonSelected
            ]}
            onPress={() => toggleSelection('sports', option.id)}
          >
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <Text style={[
              styles.optionLabel,
              selections.sports.includes(option.id) && styles.optionLabelSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.optionButton}>
          <Text style={styles.optionLabel}>Ajouter</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderAmbianceStep = () => (
    <>
      <Text style={styles.title}>Quelle ambiance préfères-tu</Text>
      <Text style={styles.subtitle}>Sélectionne 1 ou plusieurs</Text>
      <View style={styles.optionsContainer}>
        {ambianceOptions.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              selections.ambiance.includes(option.id) && styles.optionButtonSelected
            ]}
            onPress={() => toggleSelection('ambiance', option.id)}
          >
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <Text style={[
              styles.optionLabel,
              selections.ambiance.includes(option.id) && styles.optionLabelSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const renderFoodStep = () => (
    <>
      <Text style={styles.title}>Plutôt bar ou fast-food ?</Text>
      <View style={styles.optionsContainer}>
        {foodOptions.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              selections.foodTypes.includes(option.id) && styles.optionButtonSelected
            ]}
            onPress={() => toggleSelection('foodTypes', option.id)}
          >
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <Text style={[
              styles.optionLabel,
              selections.foodTypes.includes(option.id) && styles.optionLabelSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const renderBudgetStep = () => (
    <>
      <Text style={styles.title}>Ton budget habituel ?</Text>
      <View style={styles.optionsContainer}>
        {budgetOptions.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              selections.budget === option.id && styles.optionButtonSelected
            ]}
            onPress={() => selectBudget(option.id)}
          >
            <Text style={[
              styles.optionLabel,
              selections.budget === option.id && styles.optionLabelSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const isStepValid = () => {
    switch (currentStep) {
      case 'sports':
        return selections.sports.length > 0;
      case 'ambiance':
        return selections.ambiance.length > 0;
      case 'food':
        return selections.foodTypes.length > 0;
      case 'budget':
        return selections.budget !== '';
      default:
        return false;
    }
  };

  return (
    <LinearGradient
      colors={[theme.colors.gradient.start, theme.colors.gradient.end]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>⚡</Text>
        </View>
        
        <ScrollView contentContainerStyle={styles.content}>
          {currentStep === 'sports' && renderSportsStep()}
          {currentStep === 'ambiance' && renderAmbianceStep()}
          {currentStep === 'food' && renderFoodStep()}
          {currentStep === 'budget' && renderBudgetStep()}
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !isStepValid() && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!isStepValid()}
        >
          <Text style={styles.continueButtonText}>Continuer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: theme.spacing.lg,
  },
  logo: {
    fontSize: 60,
    color: theme.colors.secondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
  },
  title: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    opacity: 0.8,
  },
  optionsContainer: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  optionButton: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    minWidth: 250,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  optionButtonSelected: {
    backgroundColor: theme.colors.text,
  },
  optionIcon: {
    fontSize: 20,
  },
  optionLabel: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  optionLabelSelected: {
    color: theme.colors.secondary,
  },
  continueButton: {
    backgroundColor: theme.colors.text,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default OnboardingScreen;
