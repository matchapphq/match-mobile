import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    FlatList,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import type { StackScreenProps } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import OnboardingLayout from "./onboarding/OnboardingLayout";
import { sharedStyles, BRAND_PRIMARY, SUCCESS } from "./onboarding/styles";
import {
    USERNAME_SUGGESTIONS,
    SPORTS_OPTIONS,
    MOOD_OPTIONS,
    VENUE_OPTIONS,
    BUDGET_OPTIONS,
} from "./onboarding/options";
import { useOnboardingForm } from "../store/useOnboardingForm";
import { useStore } from "../store/useStore";
import { usePostHog } from "posthog-react-native";
import { hashId } from "../utils/analytics";
import { analytics } from "../services/analytics";

type OnboardingStackParamList = {
    OnboardingName: undefined;
    OnboardingContact: undefined;
    OnboardingSecurity: undefined;
    OnboardingUsername: undefined;
    OnboardingSports: undefined;
    OnboardingMood: undefined;
    OnboardingVenue: undefined;
    OnboardingBudget: undefined;
};

const Stack = createStackNavigator<OnboardingStackParamList>();

const COUNTRY_OPTIONS = [
    { code: "FR", flag: "🇫🇷", name: "France", dialCode: "+33", maxLength: 9, pattern: "# ## ## ## ##" },
    { code: "CN", flag: "🇨🇳", name: "Chine", dialCode: "+86", maxLength: 11, pattern: "### #### ####" },
    { code: "US", flag: "🇺🇸", name: "États-Unis", dialCode: "+1", maxLength: 10, pattern: "(###) ###-####" },
    { code: "GB", flag: "🇬🇧", name: "Royaume-Uni", dialCode: "+44", maxLength: 10, pattern: "#### ######" },
    { code: "ES", flag: "🇪🇸", name: "Espagne", dialCode: "+34", maxLength: 9, pattern: "### ### ###" },
    { code: "DE", flag: "🇩🇪", name: "Allemagne", dialCode: "+49", maxLength: 11, pattern: "#### #######" },
    { code: "BE", flag: "🇧🇪", name: "Belgique", dialCode: "+32", maxLength: 9, pattern: "### ## ## ##" },
];

const formatPhoneNumber = (value: string, pattern: string) => {
    const cleaned = value.replace(/\D/g, "");
    let result = "";
    let vIndex = 0;
    
    for (let i = 0; i < pattern.length; i++) {
        if (vIndex >= cleaned.length) break;
        if (pattern[i] === "#") {
            result += cleaned[vIndex++];
        } else {
            result += pattern[i];
        }
    }
    return result;
};

const localStyles = StyleSheet.create({
    errorText: {
        color: "#ff6b6b",
        textAlign: "center",
        marginTop: 16,
    },
    loadingText: {
        fontSize: 12,
        textAlign: "center",
        marginTop: 12,
        color: "rgba(255,255,255,0.6)",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#1c1c21",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: "70%",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 16,
    },
    countryItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.08)",
    },
    countryItemFlag: {
        fontSize: 24,
        marginRight: 12,
    },
    countryItemName: {
        fontSize: 16,
        color: "#fff",
        flex: 1,
    },
    countryItemCode: {
        fontSize: 16,
        color: "rgba(255,255,255,0.6)",
    },
});

type StepScreenProps<RouteName extends keyof OnboardingStackParamList> =
    StackScreenProps<OnboardingStackParamList, RouteName>;

const accent = { color: BRAND_PRIMARY };

const NameStepScreen: React.FC<StepScreenProps<"OnboardingName">> = ({
    navigation,
}) => {
    const { data, updateField } = useOnboardingForm();
    const posthog = usePostHog();
    const canContinue =
        data.firstName.trim().length > 0 && data.lastName.trim().length > 0;

    return (
        <OnboardingLayout
            step={1}
            title={
                <>
                    Parlons de <Text style={accent}>toi</Text>
                </>
            }
            subtitle="Dis-nous comment tu t'appelles pour personnaliser ton expérience sur Match."
            canContinue={canContinue}
            onNext={() => {
                posthog.capture("onboarding_step_completed", { step_name: "name" });
                navigation.navigate("OnboardingContact");
            }}
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
                        onChangeText={(value) =>
                            updateField("firstName", value)
                        }
                    />
                    <MaterialIcons
                        name="person"
                        size={20}
                        color="rgba(255,255,255,0.3)"
                        style={sharedStyles.inputIcon}
                    />
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
                    <MaterialIcons
                        name="badge"
                        size={20}
                        color="rgba(255,255,255,0.3)"
                        style={sharedStyles.inputIcon}
                    />
                </View>
            </View>
        </OnboardingLayout>
    );
};

const ContactStepScreen: React.FC<StepScreenProps<"OnboardingContact">> = ({
    navigation,
}) => {
    const { data, updateField } = useOnboardingForm();
    const posthog = usePostHog();
    const [selectedCountry, setSelectedCountry] = useState(COUNTRY_OPTIONS[0]);
    const [modalVisible, setModalVisible] = useState(false);

    const canContinue =
        data.email.includes("@") && 
        data.phone.replace(/\D/g, "").length === selectedCountry.maxLength;

    const handlePhoneChange = (text: string) => {
        // Strip non-digits
        const cleaned = text.replace(/\D/g, "");
        // Truncate to max digits
        const truncated = cleaned.slice(0, selectedCountry.maxLength);
        // Format
        const formatted = formatPhoneNumber(truncated, selectedCountry.pattern);
        updateField("phone", formatted);
    };

    return (
        <OnboardingLayout
            step={2}
            title="Coordonnées"
            subtitle="Comment peut-on te joindre pour confirmer tes réservations ?"
            canContinue={canContinue}
            onNext={() => {
                posthog.capture("onboarding_step_completed", { step_name: "contact" });
                navigation.navigate("OnboardingSecurity");
            }}
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
                        style={[
                            sharedStyles.input,
                            sharedStyles.inputWithLeftIcon,
                        ]}
                        placeholder="Entrez votre email"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        value={data.email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onChangeText={(value) => updateField("email", value)}
                    />
                    {data.email.includes("@") && (
                        <MaterialIcons
                            name="check-circle"
                            size={20}
                            color={SUCCESS}
                            style={sharedStyles.inputIcon}
                        />
                    )}
                </View>
            </View>

            <View style={sharedStyles.formGroup}>
                <Text style={sharedStyles.label}>Numéro de téléphone</Text>
                <View style={sharedStyles.phoneRow}>
                    <TouchableOpacity
                        style={sharedStyles.countryCode}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={sharedStyles.countryFlag}>{selectedCountry.flag}</Text>
                        <Text style={sharedStyles.countryCodeText}>{selectedCountry.dialCode}</Text>
                        <MaterialIcons
                            name="expand-more"
                            size={16}
                            color="rgba(255,255,255,0.3)"
                        />
                    </TouchableOpacity>
                    <View
                        style={[
                            sharedStyles.inputWrapper,
                            sharedStyles.phoneInput,
                        ]}
                    >
                        <TextInput
                            style={sharedStyles.input}
                            placeholder={selectedCountry.pattern.replace(/#/g, "0")}
                            placeholderTextColor="rgba(255,255,255,0.2)"
                            value={data.phone}
                            onChangeText={handlePhoneChange}
                            keyboardType="phone-pad"
                            maxLength={selectedCountry.pattern.length}
                        />
                    </View>
                </View>
                <Text style={sharedStyles.hint}>
                    Un code de vérification te sera envoyé par SMS.
                </Text>
            </View>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={localStyles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={localStyles.modalContent}>
                        <Text style={localStyles.modalTitle}>Choisir un pays</Text>
                        <FlatList
                            data={COUNTRY_OPTIONS}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={localStyles.countryItem}
                                    onPress={() => {
                                        setSelectedCountry(item);
                                        // Reset phone when country changes to avoid mismatched formats
                                        updateField("phone", "");
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={localStyles.countryItemFlag}>{item.flag}</Text>
                                    <Text style={localStyles.countryItemName}>{item.name}</Text>
                                    <Text style={localStyles.countryItemCode}>{item.dialCode}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </OnboardingLayout>
    );
};

const SecurityStepScreen: React.FC<
    StepScreenProps<"OnboardingSecurity">
> = ({ navigation }) => {
    const { data, updateField } = useOnboardingForm();
    const posthog = usePostHog();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const passwordsMatch =
        data.password.trim().length >= 6 &&
        data.password === data.confirmPassword &&
        data.confirmPassword.length >= 6;

    return (
        <OnboardingLayout
            step={3}
            title="Sécurité"
            subtitle="Protège ton compte en définissant un mot de passe sécurisé."
            canContinue={passwordsMatch}
            onNext={() => {
                posthog.capture("onboarding_step_completed", { step_name: "security" });
                navigation.navigate("OnboardingUsername");
            }}
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
                        style={[
                            sharedStyles.input,
                            sharedStyles.inputWithLeftIcon,
                        ]}
                        placeholder="••••••••"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        value={data.password}
                        secureTextEntry={!showPassword}
                        onChangeText={(value) => updateField("password", value)}
                    />
                    <TouchableOpacity
                        style={sharedStyles.visibilityBtn}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <MaterialIcons
                            name={
                                showPassword ? "visibility-off" : "visibility"
                            }
                            size={20}
                            color="rgba(255,255,255,0.4)"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={sharedStyles.formGroup}>
                <Text style={sharedStyles.label}>
                    Confirmer le mot de passe
                </Text>
                <View style={sharedStyles.inputWrapper}>
                    <MaterialIcons
                        name="lock-reset"
                        size={20}
                        color="rgba(255,255,255,0.5)"
                        style={sharedStyles.inputIconLeft}
                    />
                    <TextInput
                        style={[
                            sharedStyles.input,
                            sharedStyles.inputWithLeftIcon,
                        ]}
                        placeholder="••••••••"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        value={data.confirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        onChangeText={(value) =>
                            updateField("confirmPassword", value)
                        }
                    />
                    <TouchableOpacity
                        style={sharedStyles.visibilityBtn}
                        onPress={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                        }
                    >
                        <MaterialIcons
                            name={
                                showConfirmPassword
                                    ? "visibility-off"
                                    : "visibility"
                            }
                            size={20}
                            color="rgba(255,255,255,0.4)"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </OnboardingLayout>
    );
};

const UsernameStepScreen: React.FC<
    StepScreenProps<"OnboardingUsername">
> = ({ navigation }) => {
    const { data, updateField } = useOnboardingForm();
    const posthog = usePostHog();
    const canContinue = data.username.trim().length >= 3;

    return (
        <OnboardingLayout
            step={4}
            title="Ton identité unique"
            subtitle="Choisis un nom d'utilisateur pour que tes amis te trouvent facilement."
            canContinue={canContinue}
            onNext={() => {
                posthog.capture("onboarding_step_completed", { step_name: "username" });
                navigation.navigate("OnboardingSports");
            }}
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
                {data.username.length > 2 && (
                    <MaterialIcons
                        name="check-circle"
                        size={24}
                        color={SUCCESS}
                    />
                )}
            </View>
            {data.username.length > 2 && (
                <Text style={sharedStyles.availableText}>
                    Ce nom d'utilisateur est disponible !
                </Text>
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
                            <Text style={sharedStyles.suggestionText}>
                                {suggestion}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </OnboardingLayout>
    );
};

const SportsStepScreen: React.FC<StepScreenProps<"OnboardingSports">> = ({
    navigation,
}) => {
    const { data, toggleArrayValue } = useOnboardingForm();
    const posthog = usePostHog();
    const canContinue = data.fav_sports.length > 0;

    return (
        <OnboardingLayout
            step={5}
            title={
                <>
                    Quels sports {"\n"}
                    <Text style={accent}>t'intéressent ?</Text>
                </>
            }
            subtitle="Sélectionne tes favoris pour personnaliser ton flux et trouver les meilleurs bars."
            canContinue={canContinue}
            onNext={() => {
                posthog.capture("onboarding_step_completed", { step_name: "sports" });
                navigation.navigate("OnboardingMood");
            }}
            onBack={() => navigation.goBack()}
        >
            <View style={sharedStyles.optionsList}>
                {SPORTS_OPTIONS.map((sport) => {
                    const isSelected = data.fav_sports.includes(sport.id);
                    return (
                        <TouchableOpacity
                            key={sport.id}
                            style={[
                                sharedStyles.sportOption,
                                isSelected && sharedStyles.sportOptionSelected,
                            ]}
                            onPress={() =>
                                toggleArrayValue("fav_sports", sport.id)
                            }
                            activeOpacity={0.9}
                        >
                            <View style={sharedStyles.sportLeft}>
                                <View
                                    style={[
                                        sharedStyles.sportIconWrapper,
                                        isSelected &&
                                            sharedStyles.sportIconSelected,
                                    ]}
                                >
                                    <MaterialIcons
                                        name={sport.icon}
                                        size={28}
                                        color={
                                            isSelected
                                                ? "#fff"
                                                : "rgba(255,255,255,0.4)"
                                        }
                                    />
                                </View>
                                <Text
                                    style={[
                                        sharedStyles.sportLabel,
                                        isSelected &&
                                            sharedStyles.sportLabelSelected,
                                    ]}
                                >
                                    {sport.label}
                                </Text>
                            </View>
                            {isSelected ? (
                                <View style={sharedStyles.checkCircle}>
                                    <MaterialIcons
                                        name="check"
                                        size={20}
                                        color={BRAND_PRIMARY}
                                    />
                                </View>
                            ) : (
                                <MaterialIcons
                                    name="add-circle"
                                    size={24}
                                    color="rgba(255,255,255,0.3)"
                                />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </OnboardingLayout>
    );
};

const MoodStepScreen: React.FC<StepScreenProps<"OnboardingMood">> = ({
    navigation,
}) => {
    const { data, updateField } = useOnboardingForm();
    const posthog = usePostHog();
    const canContinue = Boolean(data.ambiances[0]);

    const handleSelectMood = (id: string) => {
        updateField("ambiances", [id]);
    };

    return (
        <OnboardingLayout
            step={6}
            title="Quelle ambiance ?"
            subtitle="Choisis ton style pour que nous puissions te proposer les meilleurs spots."
            canContinue={canContinue}
            onNext={() => {
                posthog.capture("onboarding_step_completed", { step_name: "mood" });
                navigation.navigate("OnboardingVenue");
            }}
            onBack={() => navigation.goBack()}
        >
            <View style={sharedStyles.moodGrid}>
                {MOOD_OPTIONS.map((mood) => {
                    const isSelected = data.ambiances.includes(mood.id);
                    return (
                        <TouchableOpacity
                            key={mood.id}
                            style={[
                                sharedStyles.moodCard,
                                isSelected && sharedStyles.moodCardSelected,
                            ]}
                            onPress={() => handleSelectMood(mood.id)}
                            activeOpacity={0.9}
                        >
                            <MaterialIcons
                                name={mood.icon}
                                size={48}
                                color={
                                    isSelected
                                        ? BRAND_PRIMARY
                                        : "rgba(255,255,255,0.3)"
                                }
                            />
                            <Text
                                style={[
                                    sharedStyles.moodLabel,
                                    isSelected &&
                                        sharedStyles.moodLabelSelected,
                                ]}
                            >
                                {mood.label}
                            </Text>
                            <Text style={sharedStyles.moodSubtitle}>
                                {mood.subtitle}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </OnboardingLayout>
    );
};

const VenueStepScreen: React.FC<StepScreenProps<"OnboardingVenue">> = ({
    navigation,
}) => {
    const { data, updateField } = useOnboardingForm();
    const posthog = usePostHog();
    const canContinue = data.venue_types.length > 0;

    const handleSelectVenue = (id: string) => {
        updateField("venue_types", [id]);
    };

    return (
        <OnboardingLayout
            step={7}
            title={
                <>
                    Quel est votre {"\n"}
                    <Text style={accent}>style ?</Text>
                </>
            }
            subtitle="Choisis l'ambiance qui correspond à ton envie du moment."
            canContinue={canContinue}
            onNext={() => {
                posthog.capture("onboarding_step_completed", { step_name: "venue_style" });
                navigation.navigate("OnboardingBudget");
            }}
            onBack={() => navigation.goBack()}
        >
            <View style={sharedStyles.optionsList}>
                {VENUE_OPTIONS.map((venue) => {
                    const isSelected = data.venue_types.includes(venue.id);
                    return (
                        <TouchableOpacity
                            key={venue.id}
                            style={[
                                sharedStyles.venueOption,
                                isSelected && sharedStyles.venueOptionSelected,
                            ]}
                            onPress={() => handleSelectVenue(venue.id)}
                            activeOpacity={0.9}
                        >
                            <View style={sharedStyles.venueLeft}>
                                <View
                                    style={[
                                        sharedStyles.venueIconWrapper,
                                        isSelected &&
                                            sharedStyles.venueIconSelected,
                                    ]}
                                >
                                    <MaterialIcons
                                        name={venue.icon}
                                        size={26}
                                        color={
                                            isSelected
                                                ? "#000"
                                                : "rgba(255,255,255,0.4)"
                                        }
                                    />
                                </View>
                                <View style={sharedStyles.venueTexts}>
                                    <Text
                                        style={[
                                            sharedStyles.venueLabel,
                                            isSelected &&
                                                sharedStyles.venueLabelSelected,
                                        ]}
                                    >
                                        {venue.label}
                                    </Text>
                                    <Text style={sharedStyles.venueSubtitle}>
                                        {venue.subtitle}
                                    </Text>
                                </View>
                            </View>
                            <View
                                style={[
                                    sharedStyles.radioCircle,
                                    isSelected &&
                                        sharedStyles.radioCircleSelected,
                                ]}
                            >
                                {isSelected && (
                                    <MaterialIcons
                                        name="check"
                                        size={16}
                                        color="#000"
                                    />
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </OnboardingLayout>
    );
};

const BudgetStepScreen: React.FC<StepScreenProps<"OnboardingBudget">> = ({
    navigation,
}) => {
    const { data, updateField, buildRequestPayload, reset } =
        useOnboardingForm();
    const signup = useStore((state) => state.signup);
    const user = useStore((state) => state.user);
    const isLoading = useStore((state) => state.isLoading);
    const storeError = useStore((state) => state.error);
    const [submissionError, setSubmissionError] = useState<string | null>(null);
    const rootNavigation = useNavigation<any>();
    const posthog = usePostHog();

    const handleNext = async () => {
        if (!data.budget || isLoading) return;
        setSubmissionError(null);
        const payload = buildRequestPayload();
        const success = await signup(payload);
        if (success) {
            // Identify user in PostHog after successful signup with HASHED ID
            const newUser = useStore.getState().user;
            const userData = newUser?.user ?? newUser;
            if (userData?.id) {
                const anonymousId = await hashId(userData.id);
                posthog?.identify(anonymousId, {
                    fav_sports: data.fav_sports,
                    budget: data.budget,
                    is_authenticated: true,
                });
                analytics.capture("signup_success");
            }
            
            reset();
            // Navigation is handled automatically by AppNavigator's conditional rendering
        } else {
            analytics.capture("signup_failed");
            const storeError = useStore.getState().error;
            setSubmissionError(
                `${storeError || "Impossible de finaliser ton compte pour le moment"}. Merci de réessayer.`
            );
        }
    };

    return (
        <OnboardingLayout
            step={8}
            title={<>Quel est {"\n"}votre budget ?</>}
            subtitle="Nous trouverons les bars qui correspondent à tes attentes."
            canContinue={Boolean(data.budget) && !isLoading}
            nextLabel={isLoading ? "Connexion..." : "Terminer"}
            error={submissionError}
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
                            style={[
                                sharedStyles.budgetOption,
                                isSelected && sharedStyles.budgetOptionSelected,
                            ]}
                            onPress={() => updateField("budget", budget.id)}
                            activeOpacity={0.9}
                        >
                            <View style={sharedStyles.budgetCenter}>
                                <Text style={sharedStyles.budgetAmount}>
                                    {budget.label}
                                </Text>
                                <Text style={sharedStyles.budgetTier}>
                                    {budget.subtitle}
                                </Text>
                            </View>
                            {isSelected && (
                                <View style={sharedStyles.budgetCheck}>
                                    <MaterialIcons
                                        name="check-circle"
                                        size={24}
                                        color={BRAND_PRIMARY}
                                    />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </OnboardingLayout>
    );
};

const OnboardingScreen = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="OnboardingName"
                component={NameStepScreen}
            />
            <Stack.Screen
                name="OnboardingContact"
                component={ContactStepScreen}
            />
            <Stack.Screen
                name="OnboardingSecurity"
                component={SecurityStepScreen}
            />
            <Stack.Screen
                name="OnboardingUsername"
                component={UsernameStepScreen}
            />
            <Stack.Screen
                name="OnboardingSports"
                component={SportsStepScreen}
            />
            <Stack.Screen
                name="OnboardingMood"
                component={MoodStepScreen}
            />
            <Stack.Screen
                name="OnboardingVenue"
                component={VenueStepScreen}
            />
            <Stack.Screen
                name="OnboardingBudget"
                component={BudgetStepScreen}
            />
        </Stack.Navigator>
    );
};

export default OnboardingScreen;
