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
import { getOnboardingStyles, SUCCESS } from "./onboarding/styles";
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
import { hapticFeedback } from "../utils/haptics";

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
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "flex-end",
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: "70%",
        borderWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 16,
    },
    countryItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    countryItemFlag: {
        fontSize: 24,
        marginRight: 12,
    },
    countryItemName: {
        fontSize: 16,
        flex: 1,
    },
    countryItemCode: {
        fontSize: 16,
    },
});

type StepScreenProps<RouteName extends keyof OnboardingStackParamList> =
    StackScreenProps<OnboardingStackParamList, RouteName>;

const NameStepScreen: React.FC<StepScreenProps<"OnboardingName">> = ({
    navigation,
}) => {
    const { colors } = useStore();
    const styles = getOnboardingStyles(colors);
    const { data, updateField } = useOnboardingForm();
    const posthog = usePostHog();
    const canContinue =
        data.firstName.trim().length > 0 && data.lastName.trim().length > 0;

    const accent = { color: colors.accent };

    return (
        <OnboardingLayout
            step={1}
            title={
                <Text style={{ fontSize: 32, fontWeight: "700" }}>
                    Parlons de <Text style={accent}>toi</Text>
                </Text>
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
            <View style={styles.formGroup}>
                <Text style={styles.label}>Prénom</Text>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Thomas"
                        placeholderTextColor={colors.textMuted}
                        value={data.firstName}
                        onChangeText={(value) =>
                            updateField("firstName", value)
                        }
                    />
                    <MaterialIcons
                        name="person"
                        size={20}
                        color={colors.textMuted}
                        style={styles.inputIcon}
                    />
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Nom</Text>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Dubois"
                        placeholderTextColor={colors.textMuted}
                        value={data.lastName}
                        onChangeText={(value) => updateField("lastName", value)}
                    />
                    <MaterialIcons
                        name="badge"
                        size={20}
                        color={colors.textMuted}
                        style={styles.inputIcon}
                    />
                </View>
            </View>
        </OnboardingLayout>
    );
};

const ContactStepScreen: React.FC<StepScreenProps<"OnboardingContact">> = ({
    navigation,
}) => {
    const { colors } = useStore();
    const styles = getOnboardingStyles(colors);
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
            <View style={styles.formGroup}>
                <Text style={styles.label}>Adresse email</Text>
                <View style={styles.inputWrapper}>
                    <MaterialIcons
                        name="mail"
                        size={20}
                        color={colors.textMuted}
                        style={styles.inputIconLeft}
                    />
                    <TextInput
                        style={[
                            styles.input,
                            styles.inputWithLeftIcon,
                        ]}
                        placeholder="Entrez votre email"
                        placeholderTextColor={colors.textMuted}
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
                            style={styles.inputIcon}
                        />
                    )}
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Numéro de téléphone</Text>
                <View style={styles.phoneRow}>
                    <TouchableOpacity
                        style={styles.countryCode}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                        <Text style={styles.countryCodeText}>{selectedCountry.dialCode}</Text>
                        <MaterialIcons
                            name="expand-more"
                            size={16}
                            color={colors.textMuted}
                        />
                    </TouchableOpacity>
                    <View
                        style={[
                            styles.inputWrapper,
                            styles.phoneInput,
                        ]}
                    >
                        <TextInput
                            style={styles.input}
                            placeholder={selectedCountry.pattern.replace(/#/g, "0")}
                            placeholderTextColor={colors.textMuted}
                            value={data.phone}
                            onChangeText={handlePhoneChange}
                            keyboardType="phone-pad"
                            maxLength={selectedCountry.pattern.length}
                        />
                    </View>
                </View>
                <Text style={styles.hint}>
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
                    <View style={[localStyles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <Text style={[localStyles.modalTitle, { color: colors.text }]}>Choisir un pays</Text>
                        <FlatList
                            data={COUNTRY_OPTIONS}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[localStyles.countryItem, { borderBottomColor: colors.divider }]}
                                    onPress={() => {
                                        setSelectedCountry(item);
                                        // Reset phone when country changes to avoid mismatched formats
                                        updateField("phone", "");
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={localStyles.countryItemFlag}>{item.flag}</Text>
                                    <Text style={[localStyles.countryItemName, { color: colors.text }]}>{item.name}</Text>
                                    <Text style={[localStyles.countryItemCode, { color: colors.textMuted }]}>{item.dialCode}</Text>
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
    const { colors } = useStore();
    const styles = getOnboardingStyles(colors);
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
            <View style={styles.formGroup}>
                <Text style={styles.label}>Mot de passe</Text>
                <View style={styles.inputWrapper}>
                    <MaterialIcons
                        name="lock"
                        size={20}
                        color={colors.textMuted}
                        style={styles.inputIconLeft}
                    />
                    <TextInput
                        style={[
                            styles.input,
                            styles.inputWithLeftIcon,
                        ]}
                        placeholder="••••••••"
                        placeholderTextColor={colors.textMuted}
                        value={data.password}
                        secureTextEntry={!showPassword}
                        onChangeText={(value) => updateField("password", value)}
                    />
                    <TouchableOpacity
                        style={styles.visibilityBtn}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <MaterialIcons
                            name={
                                showPassword ? "visibility-off" : "visibility"
                            }
                            size={20}
                            color={colors.textMuted}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>
                    Confirmer le mot de passe
                </Text>
                <View style={styles.inputWrapper}>
                    <MaterialIcons
                        name="lock-reset"
                        size={20}
                        color={colors.textMuted}
                        style={styles.inputIconLeft}
                    />
                    <TextInput
                        style={[
                            styles.input,
                            styles.inputWithLeftIcon,
                        ]}
                        placeholder="••••••••"
                        placeholderTextColor={colors.textMuted}
                        value={data.confirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        onChangeText={(value) =>
                            updateField("confirmPassword", value)
                        }
                    />
                    <TouchableOpacity
                        style={styles.visibilityBtn}
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
                            color={colors.textMuted}
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
    const { colors } = useStore();
    const styles = getOnboardingStyles(colors);
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
            <View style={styles.usernameInputWrapper}>
                <Text style={styles.atSymbol}>@</Text>
                <TextInput
                    style={styles.usernameInput}
                    placeholder="username"
                    placeholderTextColor={colors.textMuted}
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
                <Text style={styles.availableText}>
                    Ce nom d'utilisateur est disponible !
                </Text>
            )}

            <View style={styles.suggestionsSection}>
                <Text style={styles.suggestionsLabel}>SUGGESTIONS</Text>
                <View style={styles.suggestionsRow}>
                    {USERNAME_SUGGESTIONS.map((suggestion) => (
                        <TouchableOpacity
                            key={suggestion}
                            style={styles.suggestionChip}
                            onPress={() => updateField("username", suggestion)}
                        >
                            <Text style={styles.suggestionText}>
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
    const { colors } = useStore();
    const styles = getOnboardingStyles(colors);
    const { data, toggleArrayValue } = useOnboardingForm();
    const posthog = usePostHog();
    const canContinue = data.fav_sports.length > 0;

    const accent = { color: colors.accent };

    return (
        <OnboardingLayout
            step={5}
            title={
                <Text style={{ fontSize: 32, fontWeight: "700" }}>
                    Quels sports {"\n"}
                    <Text style={accent}>t'intéressent ?</Text>
                </Text>
            }
            subtitle="Sélectionne tes favoris pour personnaliser ton flux et trouver les meilleurs lieux."
            canContinue={canContinue}
            onNext={() => {
                posthog.capture("onboarding_step_completed", { step_name: "sports" });
                navigation.navigate("OnboardingMood");
            }}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.optionsList}>
                {SPORTS_OPTIONS.map((sport) => {
                    const isSelected = data.fav_sports.includes(sport.id);
                    return (
                        <TouchableOpacity
                            key={sport.id}
                            style={[
                                styles.sportOption,
                                isSelected && styles.sportOptionSelected,
                            ]}
                            onPress={() =>
                                toggleArrayValue("fav_sports", sport.id)
                            }
                            activeOpacity={0.9}
                        >
                            <View style={styles.sportLeft}>
                                <View
                                    style={[
                                        styles.sportIconWrapper,
                                        isSelected &&
                                            styles.sportIconSelected,
                                    ]}
                                >
                                    <MaterialIcons
                                        name={sport.icon}
                                        size={28}
                                        color={
                                            isSelected
                                                ? colors.textInverse
                                                : colors.textMuted
                                        }
                                    />
                                </View>
                                <Text
                                    style={[
                                        styles.sportLabel,
                                        isSelected &&
                                            styles.sportLabelSelected,
                                    ]}
                                >
                                    {sport.label}
                                </Text>
                            </View>
                            {isSelected ? (
                                <View style={styles.checkCircle}>
                                    <MaterialIcons
                                        name="check"
                                        size={20}
                                        color={colors.accent}
                                    />
                                </View>
                            ) : (
                                <MaterialIcons
                                    name="add-circle"
                                    size={24}
                                    color={colors.border}
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
    const { colors } = useStore();
    const styles = getOnboardingStyles(colors);
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
            <View style={styles.moodGrid}>
                {MOOD_OPTIONS.map((mood) => {
                    const isSelected = data.ambiances.includes(mood.id);
                    return (
                        <TouchableOpacity
                            key={mood.id}
                            style={[
                                styles.moodCard,
                                isSelected && styles.moodCardSelected,
                            ]}
                            onPress={() => handleSelectMood(mood.id)}
                            activeOpacity={0.9}
                        >
                            <MaterialIcons
                                name={mood.icon}
                                size={48}
                                color={
                                    isSelected
                                        ? colors.accent
                                        : colors.textMuted
                                }
                            />
                            <Text
                                style={[
                                    styles.moodLabel,
                                    isSelected &&
                                        styles.moodLabelSelected,
                                ]}
                            >
                                {mood.label}
                            </Text>
                            <Text style={styles.moodSubtitle}>
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
    const { colors } = useStore();
    const styles = getOnboardingStyles(colors);
    const { data, updateField } = useOnboardingForm();
    const posthog = usePostHog();
    const canContinue = data.venue_types.length > 0;

    const handleSelectVenue = (id: string) => {
        updateField("venue_types", [id]);
    };

    const accent = { color: colors.accent };

    return (
        <OnboardingLayout
            step={7}
            title={
                <Text style={{ fontSize: 32, fontWeight: "700" }}>
                    Quel est votre {"\n"}
                    <Text style={accent}>style ?</Text>
                </Text>
            }
            subtitle="Choisis l'ambiance qui correspond à ton envie du moment."
            canContinue={canContinue}
            onNext={() => {
                posthog.capture("onboarding_step_completed", { step_name: "venue_style" });
                navigation.navigate("OnboardingBudget");
            }}
            onBack={() => navigation.goBack()}
        >
            <View style={styles.optionsList}>
                {VENUE_OPTIONS.map((venue) => {
                    const isSelected = data.venue_types.includes(venue.id);
                    return (
                        <TouchableOpacity
                            key={venue.id}
                            style={[
                                styles.venueOption,
                                isSelected && styles.venueOptionSelected,
                            ]}
                            onPress={() => handleSelectVenue(venue.id)}
                            activeOpacity={0.9}
                        >
                            <View style={styles.venueLeft}>
                                <View
                                    style={[
                                        styles.venueIconWrapper,
                                        isSelected &&
                                            styles.venueIconSelected,
                                    ]}
                                >
                                    <MaterialIcons
                                        name={venue.icon}
                                        size={26}
                                        color={
                                            isSelected
                                                ? colors.white
                                                : colors.textMuted
                                        }
                                    />
                                </View>
                                <View style={styles.venueTexts}>
                                    <Text
                                        style={[
                                            styles.venueLabel,
                                            isSelected &&
                                                styles.venueLabelSelected,
                                        ]}
                                    >
                                        {venue.label}
                                    </Text>
                                    <Text style={styles.venueSubtitle}>
                                        {venue.subtitle}
                                    </Text>
                                </View>
                            </View>
                            <View
                                style={[
                                    styles.radioCircle,
                                    isSelected &&
                                        styles.radioCircleSelected,
                                ]}
                            >
                                {isSelected && (
                                    <MaterialIcons
                                        name="check"
                                        size={16}
                                        color={colors.white}
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

const BudgetStepScreen: React.FC<StepScreenProps<"OnboardingBudget"> & { onboardingStartTime: number }> = ({
    navigation,
    onboardingStartTime,
}) => {
    const { colors } = useStore();
    const styles = getOnboardingStyles(colors);
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
            const duration = Math.floor((Date.now() - onboardingStartTime) / 1000);
            analytics.track("onboarding_completed", {
                duration_seconds: duration,
            });
            hapticFeedback.success();
            reset();
            // Navigation is handled automatically by AppNavigator's conditional rendering
        } else {
            analytics.capture("signup_failed");
            hapticFeedback.error();
            const storeError = useStore.getState().error;
            setSubmissionError(
                `${storeError || "Impossible de finaliser ton compte pour le moment"}. Merci de réessayer.`
            );
        }
    };

    return (
        <OnboardingLayout
            step={8}
            title={
                <Text style={{ fontSize: 32, fontWeight: "700" }}>
                    Quel est {"\n"}votre budget ?
                </Text>
            }
            subtitle="Nous trouverons les lieux qui correspondent à tes attentes."
            canContinue={Boolean(data.budget) && !isLoading}
            nextLabel={isLoading ? "Connexion..." : "Terminer"}
            error={submissionError}
            onNext={handleNext}
            onBack={() => navigation.goBack()}
            footerNote="Choix modifiable plus tard dans les réglages."
        >
            <View style={styles.budgetList}>
                {BUDGET_OPTIONS.map((budget) => {
                    const isSelected = data.budget === budget.id;
                    return (
                        <TouchableOpacity
                            key={budget.id}
                            style={[
                                styles.budgetOption,
                                isSelected && styles.budgetOptionSelected,
                            ]}
                            onPress={() => updateField("budget", budget.id)}
                            activeOpacity={0.9}
                        >
                            <View style={styles.budgetCenter}>
                                <Text style={styles.budgetAmount}>
                                    {budget.label}
                                </Text>
                                <Text style={styles.budgetTier}>
                                    {budget.subtitle}
                                </Text>
                            </View>
                            {isSelected && (
                                <View style={styles.budgetCheck}>
                                    <MaterialIcons
                                        name="check-circle"
                                        size={24}
                                        color={colors.accent}
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
    const startTime = React.useRef(Date.now());

    useEffect(() => {
        analytics.track('onboarding_started');
    }, []);

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
            >
                {(props) => <BudgetStepScreen {...props} onboardingStartTime={startTime.current} />}
            </Stack.Screen>
        </Stack.Navigator>
    );
};

export default OnboardingScreen;
