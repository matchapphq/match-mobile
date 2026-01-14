import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import type { StackScreenProps } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import TestOnboardingLayout from "./testOnboarding/TestOnboardingLayout";
import {
    sharedStyles,
    BRAND_PRIMARY,
    SUCCESS,
} from "./testOnboarding/styles";
import {
    USERNAME_SUGGESTIONS,
    SPORTS_OPTIONS,
    MOOD_OPTIONS,
    VENUE_OPTIONS,
    BUDGET_OPTIONS,
} from "./testOnboarding/options";
import {
    useTestOnboardingForm,
    TEST_ONBOARDING_TOTAL_STEPS,
} from "../store/useTestOnboardingForm";
import { useStore } from "../store/useStore";

type TestOnboardingStackParamList = {
    TestOnboardingName: undefined;
    TestOnboardingContact: undefined;
    TestOnboardingSecurity: undefined;
    TestOnboardingUsername: undefined;
    TestOnboardingSports: undefined;
    TestOnboardingMood: undefined;
    TestOnboardingVenue: undefined;
    TestOnboardingBudget: undefined;
};

const Stack = createStackNavigator<TestOnboardingStackParamList>();

type StepScreenProps<RouteName extends keyof TestOnboardingStackParamList> = StackScreenProps<
    TestOnboardingStackParamList,
    RouteName
>;

const accent = { color: BRAND_PRIMARY };

const NameStepScreen: React.FC<StepScreenProps<"TestOnboardingName">> = ({ navigation }) => {
    const { data, updateField } = useTestOnboardingForm();
    const canContinue = data.firstName.trim().length > 0 && data.lastName.trim().length > 0;

    return (
        <TestOnboardingLayout
            step={1}
            title={
                <>
                    Parlons de <Text style={accent}>toi</Text>
                </>
            }
            subtitle="Dis-nous comment tu t'appelles pour personnaliser ton expérience sur Match."
            canContinue={canContinue}
            onNext={() => navigation.navigate("TestOnboardingContact")}
            onBack={() => navigation.goBack()}
            footerNote="En continuant, tu acceptes nos CGU et notre Politique de confidentialité."
        >
            <View style={sharedStyles.formGroup}>
                <Text style={sharedStyles.label}>Prénom</Text>
                <View style={sharedStyles.inputWrapper}>
                    <TextInput
                        style={sharedStyles.input}
                        placeholder="Ex: Thomas"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        value={data.firstName}
                        onChangeText={(value) => updateField("firstName", value)}
                    />
                    <MaterialIcons name="person" size={20} color="rgba(255,255,255,0.3)" style={sharedStyles.inputIcon} />
                </View>
            </View>

            <View style={sharedStyles.formGroup}>
                <Text style={sharedStyles.label}>Nom</Text>
                <View style={sharedStyles.inputWrapper}>
                    <TextInput
                        style={sharedStyles.input}
                        placeholder="Ex: Dubois"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        value={data.lastName}
                        onChangeText={(value) => updateField("lastName", value)}
                    />
                    <MaterialIcons name="badge" size={20} color="rgba(255,255,255,0.3)" style={sharedStyles.inputIcon} />
                </View>
            </View>
        </TestOnboardingLayout>
    );
};

const ContactStepScreen: React.FC<StepScreenProps<"TestOnboardingContact">> = ({ navigation }) => {
    const { data, updateField } = useTestOnboardingForm();
    const canContinue = data.email.includes("@") && data.phone.trim().length >= 8;

    return (
        <TestOnboardingLayout
            step={2}
            title="Coordonnées"
            subtitle="Comment peut-on te joindre pour confirmer tes réservations ?"
            canContinue={canContinue}
            onNext={() => navigation.navigate("TestOnboardingSecurity")}
            onBack={() => navigation.goBack()}
        >
            <View style={sharedStyles.formGroup}>
                <Text style={sharedStyles.label}>Adresse email</Text>
                <View style={sharedStyles.inputWrapper}>
                    <MaterialIcons
                        name="mail"
                        size={20}
                        color="rgba(255,255,255,0.5)"
                        style={sharedStyles.inputIconLeft}
                    />
                    <TextInput
                        style={[sharedStyles.input, sharedStyles.inputWithLeftIcon]}
                        placeholder="Entrez votre email"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        value={data.email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onChangeText={(value) => updateField("email", value)}
                    />
                    {data.email.includes("@") && (
                        <MaterialIcons name="check-circle" size={20} color={SUCCESS} style={sharedStyles.inputIcon} />
                    )}
                </View>
            </View>

            <View style={sharedStyles.formGroup}>
                <Text style={sharedStyles.label}>Numéro de téléphone</Text>
                <View style={sharedStyles.phoneRow}>
                    <View style={sharedStyles.countryCode}>
                        <Text style={sharedStyles.countryFlag}>🇫🇷</Text>
                        <Text style={sharedStyles.countryCodeText}>+33</Text>
                        <MaterialIcons name="expand-more" size={16} color="rgba(255,255,255,0.3)" />
                    </View>
                    <View style={[sharedStyles.inputWrapper, sharedStyles.phoneInput]}>
                        <TextInput
                            style={sharedStyles.input}
                            placeholder="6 12 34 56 78"
                            placeholderTextColor="rgba(255,255,255,0.2)"
                            value={data.phone}
                            onChangeText={(value) => updateField("phone", value)}
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>
                <Text style={sharedStyles.hint}>Un code de vérification te sera envoyé par SMS.</Text>
            </View>
        </TestOnboardingLayout>
    );
};

const SecurityStepScreen: React.FC<StepScreenProps<"TestOnboardingSecurity">> = ({ navigation }) => {
    const { data, updateField } = useTestOnboardingForm();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const passwordsMatch =
        data.password.trim().length >= 6 && data.password === data.confirmPassword && data.confirmPassword.length >= 6;

    return (
        <TestOnboardingLayout
            step={3}
            title="Sécurité"
            subtitle="Protège ton compte en définissant un mot de passe sécurisé."
            canContinue={passwordsMatch}
            onNext={() => navigation.navigate("TestOnboardingUsername")}
            onBack={() => navigation.goBack()}
        >
            <View style={sharedStyles.formGroup}>
                <Text style={sharedStyles.label}>Mot de passe</Text>
                <View style={sharedStyles.inputWrapper}>
                    <MaterialIcons
                        name="lock"
                        size={20}
                        color="rgba(255,255,255,0.5)"
                        style={sharedStyles.inputIconLeft}
                    />
                    <TextInput
                        style={[sharedStyles.input, sharedStyles.inputWithLeftIcon]}
                        placeholder="••••••••"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        value={data.password}
                        secureTextEntry={!showPassword}
                        onChangeText={(value) => updateField("password", value)}
                    />
                    <TouchableOpacity style={sharedStyles.visibilityBtn} onPress={() => setShowPassword(!showPassword)}>
                        <MaterialIcons
                            name={showPassword ? "visibility-off" : "visibility"}
                            size={20}
                            color="rgba(255,255,255,0.4)"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={sharedStyles.formGroup}>
                <Text style={sharedStyles.label}>Confirmer le mot de passe</Text>
                <View style={sharedStyles.inputWrapper}>
                    <MaterialIcons
                        name="lock-reset"
                        size={20}
                        color="rgba(255,255,255,0.5)"
                        style={sharedStyles.inputIconLeft}
                    />
                    <TextInput
                        style={[sharedStyles.input, sharedStyles.inputWithLeftIcon]}
                        placeholder="••••••••"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        value={data.confirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        onChangeText={(value) => updateField("confirmPassword", value)}
                    />
                    <TouchableOpacity
                        style={sharedStyles.visibilityBtn}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        <MaterialIcons
                            name={showConfirmPassword ? "visibility-off" : "visibility"}
                            size={20}
                            color="rgba(255,255,255,0.4)"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </TestOnboardingLayout>
    );
};

const UsernameStepScreen: React.FC<StepScreenProps<"TestOnboardingUsername">> = ({ navigation }) => {
    const { data, updateField } = useTestOnboardingForm();
    const canContinue = data.username.trim().length >= 3;

    return (
        <TestOnboardingLayout
            step={4}
            title="Ton identité unique"
            subtitle="Choisis un nom d'utilisateur pour que tes amis te trouvent facilement."
            canContinue={canContinue}
            onNext={() => navigation.navigate("TestOnboardingSports")}
            onBack={() => navigation.goBack()}
            footerNote="Tu pourras le modifier plus tard dans ton profil."
        >
            <View style={sharedStyles.usernameInputWrapper}>
                <Text style={sharedStyles.atSymbol}>@</Text>
                <TextInput
                    style={sharedStyles.usernameInput}
                    placeholder="username"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={data.username}
                    autoCapitalize="none"
                    onChangeText={(value) => updateField("username", value)}
                />
                {data.username.length > 2 && <MaterialIcons name="check-circle" size={24} color={SUCCESS} />}
            </View>
            {data.username.length > 2 && (
                <Text style={sharedStyles.availableText}>Ce nom d'utilisateur est disponible !</Text>
            )}

            <View style={sharedStyles.suggestionsSection}>
                <Text style={sharedStyles.suggestionsLabel}>SUGGESTIONS</Text>
                <View style={sharedStyles.suggestionsRow}>
                    {USERNAME_SUGGESTIONS.map((suggestion) => (
                        <TouchableOpacity
                            key={suggestion}
                            style={sharedStyles.suggestionChip}
                            onPress={() => updateField("username", suggestion)}
                        >
                            <Text style={sharedStyles.suggestionText}>{suggestion}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </TestOnboardingLayout>
    );
};

const SportsStepScreen: React.FC<StepScreenProps<"TestOnboardingSports">> = ({ navigation }) => {
    const { data, toggleArrayValue } = useTestOnboardingForm();
    const canContinue = data.fav_sports.length > 0;

    return (
        <TestOnboardingLayout
            step={5}
            title={
                <>
                    Quels sports {"\n"}
                    <Text style={accent}>t'intéressent ?</Text>
                </>
            }
            subtitle="Sélectionne tes favoris pour personnaliser ton flux et trouver les meilleurs bars."
            canContinue={canContinue}
            onNext={() => navigation.navigate("TestOnboardingMood")}
            onBack={() => navigation.goBack()}
        >
            <View style={sharedStyles.optionsList}>
                {SPORTS_OPTIONS.map((sport) => {
                    const isSelected = data.fav_sports.includes(sport.id);
                    return (
                        <TouchableOpacity
                            key={sport.id}
                            style={[sharedStyles.sportOption, isSelected && sharedStyles.sportOptionSelected]}
                            onPress={() => toggleArrayValue("fav_sports", sport.id)}
                            activeOpacity={0.9}
                        >
                            <View style={sharedStyles.sportLeft}>
                                <View
                                    style={[
                                        sharedStyles.sportIconWrapper,
                                        isSelected && sharedStyles.sportIconSelected,
                                    ]}
                                >
                                    <MaterialIcons
                                        name={sport.icon}
                                        size={28}
                                        color={isSelected ? "#fff" : "rgba(255,255,255,0.4)"}
                                    />
                                </View>
                                <Text style={[sharedStyles.sportLabel, isSelected && sharedStyles.sportLabelSelected]}>
                                    {sport.label}
                                </Text>
                            </View>
                            {isSelected ? (
                                <View style={sharedStyles.checkCircle}>
                                    <MaterialIcons name="check" size={20} color={BRAND_PRIMARY} />
                                </View>
                            ) : (
                                <MaterialIcons name="add-circle" size={24} color="rgba(255,255,255,0.3)" />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </TestOnboardingLayout>
    );
};

const MoodStepScreen: React.FC<StepScreenProps<"TestOnboardingMood">> = ({ navigation }) => {
    const { data, updateField } = useTestOnboardingForm();
    const canContinue = Boolean(data.ambiances[0]);

    const handleSelectMood = (id: string) => {
        updateField("ambiances", [id]);
    };

    return (
        <TestOnboardingLayout
            step={6}
            title="Quelle ambiance ?"
            subtitle="Choisis ton style pour que nous puissions te proposer les meilleurs spots."
            canContinue={canContinue}
            onNext={() => navigation.navigate("TestOnboardingVenue")}
            onBack={() => navigation.goBack()}
        >
            <View style={sharedStyles.moodGrid}>
                {MOOD_OPTIONS.map((mood) => {
                    const isSelected = data.ambiances.includes(mood.id);
                    return (
                        <TouchableOpacity
                            key={mood.id}
                            style={[sharedStyles.moodCard, isSelected && sharedStyles.moodCardSelected]}
                            onPress={() => handleSelectMood(mood.id)}
                            activeOpacity={0.9}
                        >
                            <MaterialIcons
                                name={mood.icon}
                                size={48}
                                color={isSelected ? BRAND_PRIMARY : "rgba(255,255,255,0.3)"}
                            />
                            <Text style={[sharedStyles.moodLabel, isSelected && sharedStyles.moodLabelSelected]}>
                                {mood.label}
                            </Text>
                            <Text style={sharedStyles.moodSubtitle}>{mood.subtitle}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </TestOnboardingLayout>
    );
};

const VenueStepScreen: React.FC<StepScreenProps<"TestOnboardingVenue">> = ({ navigation }) => {
    const { data, updateField } = useTestOnboardingForm();
    const canContinue = data.venue_types.length > 0;

    const handleSelectVenue = (id: string) => {
        updateField("venue_types", [id]);
    };

    return (
        <TestOnboardingLayout
            step={7}
            title={
                <>
                    Quel est votre {"\n"}
                    <Text style={accent}>style ?</Text>
                </>
            }
            subtitle="Choisis l'ambiance qui correspond à ton envie du moment."
            canContinue={canContinue}
            onNext={() => navigation.navigate("TestOnboardingBudget")}
            onBack={() => navigation.goBack()}
        >
            <View style={sharedStyles.optionsList}>
                {VENUE_OPTIONS.map((venue) => {
                    const isSelected = data.venue_types.includes(venue.id);
                    return (
                        <TouchableOpacity
                            key={venue.id}
                            style={[sharedStyles.venueOption, isSelected && sharedStyles.venueOptionSelected]}
                            onPress={() => handleSelectVenue(venue.id)}
                            activeOpacity={0.9}
                        >
                            <View style={sharedStyles.venueLeft}>
                                <View
                                    style={[
                                        sharedStyles.venueIconWrapper,
                                        isSelected && sharedStyles.venueIconSelected,
                                    ]}
                                >
                                    <MaterialIcons
                                        name={venue.icon}
                                        size={26}
                                        color={isSelected ? "#000" : "rgba(255,255,255,0.4)"}
                                    />
                                </View>
                                <View style={sharedStyles.venueTexts}>
                                    <Text
                                        style={[sharedStyles.venueLabel, isSelected && sharedStyles.venueLabelSelected]}
                                    >
                                        {venue.label}
                                    </Text>
                                    <Text style={sharedStyles.venueSubtitle}>{venue.subtitle}</Text>
                                </View>
                            </View>
                            <View style={[sharedStyles.radioCircle, isSelected && sharedStyles.radioCircleSelected]}>
                                {isSelected && <MaterialIcons name="check" size={16} color="#000" />}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </TestOnboardingLayout>
    );
};

const BudgetStepScreen: React.FC<StepScreenProps<"TestOnboardingBudget">> = ({ navigation }) => {
    const { data, updateField, buildRequestPayload } = useTestOnboardingForm();
    const setOnboardingCompleted = useStore((state) => state.setOnboardingCompleted);
    const rootNavigation = useNavigation<any>();

    const handleNext = () => {
        const payload = buildRequestPayload();
        console.log("TestOnboarding mock payload:", payload);
        setOnboardingCompleted(true);
        rootNavigation.reset({
            index: 0,
            routes: [{ name: "TestTab" }],
        });
    };

    return (
        <TestOnboardingLayout
            step={8}
            title={
                <>
                    Quel est {"\n"}votre budget ?
                </>
            }
            subtitle="Nous trouverons les bars qui correspondent à tes attentes."
            canContinue={Boolean(data.budget)}
            nextLabel="Terminer"
            onNext={handleNext}
            onBack={() => navigation.goBack()}
            footerNote="Choix modifiable plus tard dans les réglages."
        >
            <View style={sharedStyles.budgetList}>
                {BUDGET_OPTIONS.map((budget) => {
                    const isSelected = data.budget === budget.id;
                    return (
                        <TouchableOpacity
                            key={budget.id}
                            style={[sharedStyles.budgetOption, isSelected && sharedStyles.budgetOptionSelected]}
                            onPress={() => updateField("budget", budget.id)}
                            activeOpacity={0.9}
                        >
                            <View style={sharedStyles.budgetCenter}>
                                <Text style={sharedStyles.budgetAmount}>{budget.label}</Text>
                                <Text style={sharedStyles.budgetTier}>{budget.subtitle}</Text>
                            </View>
                            {isSelected && (
                                <View style={sharedStyles.budgetCheck}>
                                    <MaterialIcons name="check-circle" size={24} color={BRAND_PRIMARY} />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </TestOnboardingLayout>
    );
};

const TestOnboardingScreen = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="TestOnboardingName" component={NameStepScreen} />
            <Stack.Screen name="TestOnboardingContact" component={ContactStepScreen} />
            <Stack.Screen name="TestOnboardingSecurity" component={SecurityStepScreen} />
            <Stack.Screen name="TestOnboardingUsername" component={UsernameStepScreen} />
            <Stack.Screen name="TestOnboardingSports" component={SportsStepScreen} />
            <Stack.Screen name="TestOnboardingMood" component={MoodStepScreen} />
            <Stack.Screen name="TestOnboardingVenue" component={VenueStepScreen} />
            <Stack.Screen name="TestOnboardingBudget" component={BudgetStepScreen} />
        </Stack.Navigator>
    );
};

export default TestOnboardingScreen;
