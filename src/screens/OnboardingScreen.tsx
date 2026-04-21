import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    FlatList,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    runOnJS,
} from "react-native-reanimated";
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
import { analytics } from "../services/analytics";
import { hapticFeedback } from "../utils/haptics";

const { width } = Dimensions.get("window");

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

// Reusable wrapper for each page content
const StepContent = ({ title, subtitle, children, error }: any) => {
    const { colors } = useStore();
    const styles = getOnboardingStyles(colors);
    return (
        <View style={{ width, flex: 1 }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={{ gap: 12, marginBottom: 12 }}>
                    {typeof title === "string" ? (
                        <Text style={{ fontSize: 32, fontWeight: "700", color: colors.text }}>{title}</Text>
                    ) : (
                        <View>{title}</View>
                    )}
                    {subtitle ? (
                        typeof subtitle === "string" ? (
                            <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: "300", color: colors.textSecondary }}>{subtitle}</Text>
                        ) : (
                            <View>{subtitle}</View>
                        )
                    ) : null}
                    {error ? (
                        <View style={styles.errorBanner}>
                            <MaterialIcons name="error-outline" size={20} color="#ff6b6b" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}
                </View>
                {children}
            </ScrollView>
        </View>
    );
};

const OnboardingScreen = () => {
    const { colors } = useStore();
    const navigation = useNavigation<any>();
    const posthog = usePostHog();
    const { data, updateField, toggleArrayValue, buildRequestPayload, reset } = useOnboardingForm();
    const signup = useStore((state) => state.signup);
    const isLoading = useStore((state) => state.isLoading);
    const [submissionError, setSubmissionError] = useState<string | null>(null);
    const startTime = useRef(Date.now());

    // Pager state
    const scrollX = useSharedValue(0);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    // Step-specific states
    const [selectedCountry, setSelectedCountry] = useState(COUNTRY_OPTIONS[0]);
    const [modalVisible, setModalVisible] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        analytics.track('onboarding_started');
    }, []);

    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
        onMomentumEnd: (event) => {
            const index = Math.round(event.contentOffset.x / width);
            runOnJS(setCurrentStepIndex)(index);
        },
    });

    const goToStep = (index: number) => {
        flatListRef.current?.scrollToOffset({ offset: index * width, animated: true });
        setCurrentStepIndex(index);
    };

    const handleNext = async () => {
        if (currentStepIndex < 7) {
            const stepNames = ["name", "contact", "security", "username", "sports", "mood", "venue_style"];
            posthog.capture("onboarding_step_completed", { step_name: stepNames[currentStepIndex] });
            goToStep(currentStepIndex + 1);
        } else {
            // Final step: Submit
            setSubmissionError(null);
            const payload = buildRequestPayload();
            const success = await signup(payload);
            if (success) {
                const duration = Math.floor((Date.now() - startTime.current) / 1000);
                analytics.track("onboarding_completed", { duration_seconds: duration });
                hapticFeedback.success();
                reset();
            } else {
                analytics.capture("signup_failed");
                hapticFeedback.error();
                const storeError = useStore.getState().error;
                setSubmissionError(`${storeError || "Impossible de finaliser ton compte"}. Merci de réessayer.`);
            }
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            goToStep(currentStepIndex - 1);
        } else {
            navigation.goBack();
        }
    };

    const styles = getOnboardingStyles(colors);
    const accent = { color: colors.accent };

    // Validation logic for current step
    const canContinue = (() => {
        switch (currentStepIndex) {
            case 0: return data.firstName.trim().length > 0 && data.lastName.trim().length > 0;
            case 1: return data.email.includes("@") && data.phone.replace(/\D/g, "").length === selectedCountry.maxLength;
            case 2: return data.password.trim().length >= 6 && data.password === data.confirmPassword;
            case 3: return data.username.trim().length >= 3;
            case 4: return data.fav_sports.length > 0;
            case 5: return data.ambiances.length > 0;
            case 6: return data.venue_types.length > 0;
            case 7: return Boolean(data.budget) && !isLoading;
            default: return true;
        }
    })();

    const renderStep = useCallback(({ item, index }: any) => {
        switch (index) {
            case 0: // Name
                return (
                    <StepContent
                        title={<Text style={{ fontSize: 32, fontWeight: "700", color: colors.text }}>Parlons de <Text style={accent}>toi</Text></Text>}
                        subtitle="Dis-nous comment tu t'appelles pour personnaliser ton expérience sur Match."
                    >
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Prénom</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput style={styles.input} placeholder="Ex: Thomas" placeholderTextColor={colors.textMuted} value={data.firstName} onChangeText={(val) => updateField("firstName", val)} />
                                <MaterialIcons name="person" size={20} color={colors.textMuted} style={styles.inputIcon} />
                            </View>
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Nom</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput style={styles.input} placeholder="Ex: Dubois" placeholderTextColor={colors.textMuted} value={data.lastName} onChangeText={(val) => updateField("lastName", val)} />
                                <MaterialIcons name="badge" size={20} color={colors.textMuted} style={styles.inputIcon} />
                            </View>
                        </View>
                    </StepContent>
                );
            case 1: // Contact
                return (
                    <StepContent
                        title="Coordonnées"
                        subtitle="Comment peut-on te joindre pour confirmer tes réservations ?"
                    >
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Adresse email</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialIcons name="mail" size={20} color={colors.textMuted} style={styles.inputIconLeft} />
                                <TextInput style={[styles.input, styles.inputWithLeftIcon]} placeholder="Entrez votre email" placeholderTextColor={colors.textMuted} value={data.email} keyboardType="email-address" autoCapitalize="none" onChangeText={(val) => updateField("email", val)} />
                                {data.email.includes("@") && <MaterialIcons name="check-circle" size={20} color={SUCCESS} style={styles.inputIcon} />}
                            </View>
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Numéro de téléphone</Text>
                            <View style={styles.phoneRow}>
                                <TouchableOpacity style={styles.countryCode} onPress={() => setModalVisible(true)}>
                                    <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                                    <Text style={styles.countryCodeText}>{selectedCountry.dialCode}</Text>
                                    <MaterialIcons name="expand-more" size={16} color={colors.textMuted} />
                                </TouchableOpacity>
                                <View style={[styles.inputWrapper, styles.phoneInput]}>
                                    <TextInput style={styles.input} placeholder={selectedCountry.pattern.replace(/#/g, "0")} placeholderTextColor={colors.textMuted} value={data.phone} onChangeText={(text) => {
                                        const cleaned = text.replace(/\D/g, "").slice(0, selectedCountry.maxLength);
                                        updateField("phone", formatPhoneNumber(cleaned, selectedCountry.pattern));
                                    }} keyboardType="phone-pad" maxLength={selectedCountry.pattern.length} />
                                </View>
                            </View>
                        </View>
                    </StepContent>
                );
            case 2: // Security
                return (
                    <StepContent title="Sécurité" subtitle="Protège ton compte en définissant un mot de passe sécurisé.">
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Mot de passe</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialIcons name="lock" size={20} color={colors.textMuted} style={styles.inputIconLeft} />
                                <TextInput style={[styles.input, styles.inputWithLeftIcon]} placeholder="••••••••" placeholderTextColor={colors.textMuted} value={data.password} secureTextEntry={!showPassword} onChangeText={(val) => updateField("password", val)} />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}><MaterialIcons name={showPassword ? "visibility-off" : "visibility"} size={20} color={colors.textMuted} /></TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Confirmer le mot de passe</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialIcons name="lock-reset" size={20} color={colors.textMuted} style={styles.inputIconLeft} />
                                <TextInput style={[styles.input, styles.inputWithLeftIcon]} placeholder="••••••••" placeholderTextColor={colors.textMuted} value={data.confirmPassword} secureTextEntry={!showConfirmPassword} onChangeText={(val) => updateField("confirmPassword", val)} />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}><MaterialIcons name={showConfirmPassword ? "visibility-off" : "visibility"} size={20} color={colors.textMuted} /></TouchableOpacity>
                            </View>
                        </View>
                    </StepContent>
                );
            case 3: // Username
                return (
                    <StepContent title="Ton identité unique" subtitle="Choisis un nom d'utilisateur pour que tes amis te trouvent facilement.">
                        <View style={styles.usernameInputWrapper}>
                            <Text style={styles.atSymbol}>@</Text>
                            <TextInput style={styles.usernameInput} placeholder="username" placeholderTextColor={colors.textMuted} value={data.username} autoCapitalize="none" onChangeText={(val) => updateField("username", val)} />
                            {data.username.length > 2 && <MaterialIcons name="check-circle" size={24} color={SUCCESS} />}
                        </View>
                        <View style={styles.suggestionsSection}>
                            <Text style={styles.suggestionsLabel}>SUGGESTIONS</Text>
                            <View style={styles.suggestionsRow}>
                                {USERNAME_SUGGESTIONS.map((s) => (
                                    <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => updateField("username", s)}>
                                        <Text style={styles.suggestionText}>{s}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </StepContent>
                );
            case 4: // Sports
                return (
                    <StepContent title={<Text style={{ fontSize: 32, fontWeight: "700", color: colors.text }}>Quels sports {"\n"}<Text style={accent}>t'intéressent ?</Text></Text>} subtitle="Sélectionne tes favoris pour personnaliser ton flux.">
                        <View style={styles.optionsList}>
                            {SPORTS_OPTIONS.map((sport) => {
                                const isSelected = data.fav_sports.includes(sport.id);
                                return (
                                    <TouchableOpacity key={sport.id} style={[styles.sportOption, isSelected && styles.sportOptionSelected]} onPress={() => toggleArrayValue("fav_sports", sport.id)}>
                                        <View style={styles.sportLeft}>
                                            <View style={[styles.sportIconWrapper, isSelected && styles.sportIconSelected]}>
                                                <MaterialIcons name={sport.icon} size={28} color={isSelected ? colors.textInverse : colors.textMuted} />
                                            </View>
                                            <Text style={[styles.sportLabel, isSelected && styles.sportLabelSelected]}>{sport.label}</Text>
                                        </View>
                                        {isSelected && <View style={styles.checkCircle}><MaterialIcons name="check" size={20} color={colors.accent} /></View>}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </StepContent>
                );
            case 5: // Mood
                return (
                    <StepContent title="Quelle ambiance ?" subtitle="Choisis ton style pour que nous puissions te proposer les meilleurs spots.">
                        <View style={styles.moodGrid}>
                            {MOOD_OPTIONS.map((mood) => {
                                const isSelected = data.ambiances.includes(mood.id);
                                return (
                                    <TouchableOpacity key={mood.id} style={[styles.moodCard, isSelected && styles.moodCardSelected]} onPress={() => updateField("ambiances", [mood.id])}>
                                        <MaterialIcons name={mood.icon} size={48} color={isSelected ? colors.white : colors.accent} />
                                        <Text style={[styles.moodLabel, isSelected && styles.moodLabelSelected]}>{mood.label}</Text>
                                        <Text style={[styles.moodSubtitle, isSelected && styles.moodSubtitleSelected]}>{mood.subtitle}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </StepContent>
                );
            case 6: // Venue
                return (
                    <StepContent title={<Text style={{ fontSize: 32, fontWeight: "700", color: colors.text }}>Quel est votre {"\n"}<Text style={accent}>style ?</Text></Text>} subtitle="Choisis l'ambiance qui correspond à ton envie du moment.">
                        <View style={styles.optionsList}>
                            {VENUE_OPTIONS.map((venue) => {
                                const isSelected = data.venue_types.includes(venue.id);
                                return (
                                    <TouchableOpacity key={venue.id} style={[styles.venueOption, isSelected && styles.venueOptionSelected]} onPress={() => updateField("venue_types", [venue.id])}>
                                        <View style={styles.venueLeft}>
                                            <View style={[styles.venueIconWrapper, isSelected && styles.venueIconSelected]}>
                                                <MaterialIcons name={venue.icon} size={26} color={isSelected ? colors.white : colors.textMuted} />
                                            </View>
                                            <View style={styles.venueTexts}>
                                                <Text style={[styles.venueLabel, isSelected && styles.venueLabelSelected]}>{venue.label}</Text>
                                                <Text style={[styles.venueSubtitle, isSelected && styles.venueSubtitleSelected]}>{venue.subtitle}</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>{isSelected && <MaterialIcons name="check" size={16} color={colors.white} />}</View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </StepContent>
                );
            case 7: // Budget
                return (
                    <StepContent title={<Text style={{ fontSize: 32, fontWeight: "700", color: colors.text }}>Quel est {"\n"}votre budget ?</Text>} subtitle="Nous trouverons les lieux qui correspondent à tes attentes." error={submissionError}>
                        <View style={styles.budgetList}>
                            {BUDGET_OPTIONS.map((budget) => {
                                const isSelected = data.budget === budget.id;
                                return (
                                    <TouchableOpacity key={budget.id} style={[styles.budgetOption, isSelected && styles.budgetOptionSelected]} onPress={() => updateField("budget", budget.id)}>
                                        <View style={styles.budgetCenter}>
                                            <Text style={styles.budgetAmount}>{budget.label}</Text>
                                            <Text style={styles.budgetTier}>{budget.subtitle}</Text>
                                        </View>
                                        {isSelected && <View style={styles.budgetCheck}><MaterialIcons name="check-circle" size={24} color={colors.accent} /></View>}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </StepContent>
                );
            default: return null;
        }
    }, [data, colors, accent, submissionError, selectedCountry, showPassword, showConfirmPassword]);

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <OnboardingLayout
                currentStepIndex={currentStepIndex}
                scrollX={scrollX}
                canContinue={canContinue}
                onNext={handleNext}
                onBack={handleBack}
                nextLabel={currentStepIndex === 7 ? (isLoading ? "Connexion..." : "Terminer") : "Continuer"}
                footerNote={currentStepIndex === 0 ? "En continuant, tu acceptes nos CGU et notre Politique de confidentialité." : currentStepIndex === 3 ? "Tu pourras le modifier plus tard dans ton profil." : currentStepIndex === 7 ? "Choix modifiable plus tard dans les réglages." : null}
            >
                <Animated.FlatList
                    ref={flatListRef as any}
                    data={[...Array(8)]}
                    keyExtractor={(_, i) => `step-${i}`}
                    renderItem={renderStep}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={onScroll}
                    scrollEventThrottle={16}
                    scrollEnabled={false} // Force navigation via buttons for validation, but layout will animate
                />
            </OnboardingLayout>

            <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
                <TouchableOpacity style={localStyles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
                    <View style={[localStyles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <Text style={[localStyles.modalTitle, { color: colors.text }]}>Choisir un pays</Text>
                        <FlatList data={COUNTRY_OPTIONS} keyExtractor={(item) => item.code} renderItem={({ item }) => (
                            <TouchableOpacity style={[localStyles.countryItem, { borderBottomColor: colors.divider }]} onPress={() => { setSelectedCountry(item); updateField("phone", ""); setModalVisible(false); }}>
                                <Text style={localStyles.countryItemFlag}>{item.flag}</Text>
                                <Text style={[localStyles.countryItemName, { color: colors.text }]}>{item.name}</Text>
                                <Text style={[localStyles.countryItemCode, { color: colors.textMuted }]}>{item.dialCode}</Text>
                            </TouchableOpacity>
                        )} />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const localStyles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "70%", borderWidth: 1 },
    modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
    countryItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1 },
    countryItemFlag: { fontSize: 24, marginRight: 12 },
    countryItemName: { fontSize: 16, flex: 1 },
    countryItemCode: { fontSize: 16 },
});

export default OnboardingScreen;