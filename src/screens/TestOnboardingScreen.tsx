import React, { useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
    Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useStore } from "../store/useStore";

const { width, height } = Dimensions.get("window");
const BRAND_PRIMARY = "#f47b25";
const SURFACE_DARK = "#1c1c21";
const BG_DARK = "#0b0b0f";
const SUCCESS = "#34d399";

const TOTAL_STEPS = 4;

type FormData = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    username: string;
};

const USERNAME_SUGGESTIONS = ["alex.goal", "alex_fan", "stadium_alex"];

const TestOnboardingScreen = () => {
    const navigation = useNavigation<any>();
    const setOnboardingCompleted = useStore((state) => state.setOnboardingCompleted);
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const [formData, setFormData] = useState<FormData>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        username: "",
    });

    const updateField = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const animateTransition = (callback: () => void) => {
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        ]).start();
        setTimeout(callback, 150);
    };

    const handleNext = () => {
        if (step < TOTAL_STEPS) {
            animateTransition(() => setStep(step + 1));
        } else {
            setOnboardingCompleted(true);
            navigation.replace("TestTab");
        }
    };

    const handleBack = () => {
        if (step > 1) {
            animateTransition(() => setStep(step - 1));
        } else {
            navigation.goBack();
        }
    };

    const progressWidth = `${(step / TOTAL_STEPS) * 100}%`;

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <View style={styles.stepContent}>
                        <View style={styles.iconBadge}>
                            <MaterialIcons name="badge" size={24} color={BRAND_PRIMARY} />
                        </View>
                        <Text style={styles.title}>
                            Parlons de <Text style={styles.titleAccent}>toi</Text>
                        </Text>
                        <Text style={styles.subtitle}>
                            Dis-nous comment tu t'appelles pour personnaliser ton expérience sur Match.
                        </Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Prénom</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: Thomas"
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    value={formData.firstName}
                                    onChangeText={(v) => updateField("firstName", v)}
                                />
                                <MaterialIcons name="person" size={20} color="rgba(255,255,255,0.3)" style={styles.inputIcon} />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Nom</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: Dubois"
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    value={formData.lastName}
                                    onChangeText={(v) => updateField("lastName", v)}
                                />
                                <MaterialIcons name="badge" size={20} color="rgba(255,255,255,0.3)" style={styles.inputIcon} />
                            </View>
                        </View>
                    </View>
                );

            case 2:
                return (
                    <View style={styles.stepContent}>
                        <Text style={styles.title}>Coordonnées</Text>
                        <Text style={styles.subtitle}>
                            Comment peut-on vous joindre pour confirmer vos réservations ?
                        </Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Adresse email</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialIcons name="mail" size={20} color="rgba(255,255,255,0.5)" style={styles.inputIconLeft} />
                                <TextInput
                                    style={[styles.input, styles.inputWithLeftIcon]}
                                    placeholder="Entrez votre email"
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    value={formData.email}
                                    onChangeText={(v) => updateField("email", v)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                {formData.email.includes("@") && (
                                    <MaterialIcons name="check-circle" size={20} color={SUCCESS} style={styles.inputIcon} />
                                )}
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Numéro de téléphone</Text>
                            <View style={styles.phoneRow}>
                                <TouchableOpacity style={styles.countryCode}>
                                    <Text style={styles.countryFlag}>🇫🇷</Text>
                                    <Text style={styles.countryCodeText}>+33</Text>
                                    <MaterialIcons name="expand-more" size={16} color="rgba(255,255,255,0.3)" />
                                </TouchableOpacity>
                                <View style={[styles.inputWrapper, styles.phoneInput]}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="6 12 34 56 78"
                                        placeholderTextColor="rgba(255,255,255,0.2)"
                                        value={formData.phone}
                                        onChangeText={(v) => updateField("phone", v)}
                                        keyboardType="phone-pad"
                                    />
                                </View>
                            </View>
                            <Text style={styles.hint}>Un code de vérification vous sera envoyé par SMS.</Text>
                        </View>
                    </View>
                );

            case 3:
                return (
                    <View style={styles.stepContent}>
                        <Text style={styles.title}>Sécurité</Text>
                        <Text style={styles.subtitle}>
                            Protégez votre compte en définissant un mot de passe sécurisé.
                        </Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Mot de passe</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialIcons name="lock" size={20} color="rgba(255,255,255,0.5)" style={styles.inputIconLeft} />
                                <TextInput
                                    style={[styles.input, styles.inputWithLeftIcon]}
                                    placeholder="••••••••"
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    value={formData.password}
                                    onChangeText={(v) => updateField("password", v)}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.visibilityBtn}>
                                    <MaterialIcons
                                        name={showPassword ? "visibility-off" : "visibility"}
                                        size={20}
                                        color="rgba(255,255,255,0.4)"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Confirmer le mot de passe</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialIcons name="lock-reset" size={20} color="rgba(255,255,255,0.5)" style={styles.inputIconLeft} />
                                <TextInput
                                    style={[styles.input, styles.inputWithLeftIcon]}
                                    placeholder="••••••••"
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    value={formData.confirmPassword}
                                    onChangeText={(v) => updateField("confirmPassword", v)}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.visibilityBtn}>
                                    <MaterialIcons
                                        name={showConfirmPassword ? "visibility-off" : "visibility"}
                                        size={20}
                                        color="rgba(255,255,255,0.4)"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                );

            case 4:
                return (
                    <View style={styles.stepContent}>
                        <Text style={styles.title}>Ton identité unique</Text>
                        <Text style={styles.subtitle}>
                            Choisis un nom d'utilisateur pour que tes amis puissent te trouver facilement.
                        </Text>

                        <View style={styles.usernameInputWrapper}>
                            <Text style={styles.atSymbol}>@</Text>
                            <TextInput
                                style={styles.usernameInput}
                                placeholder="username"
                                placeholderTextColor="rgba(255,255,255,0.2)"
                                value={formData.username}
                                onChangeText={(v) => updateField("username", v)}
                                autoCapitalize="none"
                            />
                            {formData.username.length > 2 && (
                                <MaterialIcons name="check-circle" size={24} color={SUCCESS} />
                            )}
                        </View>
                        {formData.username.length > 2 && (
                            <Text style={styles.availableText}>Ce nom d'utilisateur est disponible !</Text>
                        )}

                        <View style={styles.suggestionsSection}>
                            <Text style={styles.suggestionsLabel}>SUGGESTIONS</Text>
                            <View style={styles.suggestionsRow}>
                                {USERNAME_SUGGESTIONS.map((s) => (
                                    <TouchableOpacity
                                        key={s}
                                        style={styles.suggestionChip}
                                        onPress={() => updateField("username", s)}
                                    >
                                        <Text style={styles.suggestionText}>{s}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={[BG_DARK, BG_DARK]} style={StyleSheet.absoluteFillObject} />
            <View style={styles.glowTop} />
            <View style={styles.glowBottom} />

            <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardView}
                >
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                            <MaterialIcons name="arrow-back-ios-new" size={18} color="rgba(255,255,255,0.8)" />
                        </TouchableOpacity>
                        <Text style={styles.stepIndicator}>Étape {step} sur {TOTAL_STEPS}</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: progressWidth as any }]} />
                    </View>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Animated.View style={{ opacity: fadeAnim }}>{renderStepContent()}</Animated.View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.ctaButton} onPress={handleNext} activeOpacity={0.9}>
                            <Text style={styles.ctaText}>{step === TOTAL_STEPS ? "Terminer" : "Continuer"}</Text>
                            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                        </TouchableOpacity>
                        {step === 1 && (
                            <Text style={styles.termsText}>
                                En continuant, tu acceptes nos CGU et notre Politique de confidentialité.
                            </Text>
                        )}
                        {step === 4 && (
                            <Text style={styles.termsText}>Tu pourras le modifier plus tard dans ton profil.</Text>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG_DARK,
    },
    glowTop: {
        position: "absolute",
        top: -height * 0.1,
        right: -width * 0.1,
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: `${BRAND_PRIMARY}15`,
        opacity: 0.6,
    },
    glowBottom: {
        position: "absolute",
        bottom: height * 0.1,
        left: -width * 0.1,
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: width * 0.3,
        backgroundColor: `${BRAND_PRIMARY}08`,
        opacity: 0.5,
    },
    safeArea: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
        alignItems: "center",
        justifyContent: "center",
    },
    stepIndicator: {
        fontSize: 12,
        fontWeight: "500",
        letterSpacing: 1,
        color: "rgba(255,255,255,0.4)",
        textTransform: "uppercase",
    },
    progressBar: {
        height: 6,
        backgroundColor: SURFACE_DARK,
        borderRadius: 3,
        marginHorizontal: 20,
        marginBottom: 24,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: BRAND_PRIMARY,
        borderRadius: 3,
        shadowColor: BRAND_PRIMARY,
        shadowOpacity: 0.6,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    stepContent: {
        gap: 20,
    },
    iconBadge: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: `${BRAND_PRIMARY}20`,
        borderWidth: 1,
        borderColor: `${BRAND_PRIMARY}30`,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#fff",
        letterSpacing: -0.5,
    },
    titleAccent: {
        color: BRAND_PRIMARY,
    },
    subtitle: {
        fontSize: 16,
        color: "rgba(255,255,255,0.6)",
        lineHeight: 24,
        fontWeight: "300",
    },
    formGroup: {
        gap: 8,
        marginTop: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
        marginLeft: 4,
    },
    inputWrapper: {
        backgroundColor: SURFACE_DARK,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    input: {
        flex: 1,
        height: 56,
        fontSize: 16,
        color: "#fff",
    },
    inputWithLeftIcon: {
        paddingLeft: 8,
    },
    inputIcon: {
        marginLeft: 8,
    },
    inputIconLeft: {
        marginRight: 4,
    },
    visibilityBtn: {
        padding: 8,
    },
    phoneRow: {
        flexDirection: "row",
        gap: 12,
    },
    countryCode: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: SURFACE_DARK,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        paddingHorizontal: 12,
        height: 56,
    },
    countryFlag: {
        fontSize: 20,
    },
    countryCodeText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#fff",
    },
    phoneInput: {
        flex: 1,
    },
    hint: {
        fontSize: 12,
        color: "rgba(255,255,255,0.3)",
        marginLeft: 4,
        marginTop: 4,
    },
    usernameInputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: SURFACE_DARK,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: `${BRAND_PRIMARY}50`,
        paddingHorizontal: 16,
        height: 64,
        marginTop: 16,
    },
    atSymbol: {
        fontSize: 24,
        fontWeight: "600",
        color: BRAND_PRIMARY,
        marginRight: 4,
    },
    usernameInput: {
        flex: 1,
        fontSize: 22,
        fontWeight: "500",
        color: "#fff",
    },
    availableText: {
        fontSize: 14,
        color: SUCCESS,
        fontWeight: "500",
        marginTop: 8,
        marginLeft: 4,
    },
    suggestionsSection: {
        marginTop: 32,
    },
    suggestionsLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "rgba(255,255,255,0.4)",
        letterSpacing: 2,
        marginBottom: 12,
        marginLeft: 4,
    },
    suggestionsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    suggestionChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: SURFACE_DARK,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
    },
    suggestionText: {
        fontSize: 14,
        color: "rgba(255,255,255,0.7)",
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 16,
        paddingTop: 12,
        backgroundColor: BG_DARK,
    },
    ctaButton: {
        height: 56,
        borderRadius: 16,
        backgroundColor: BRAND_PRIMARY,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        shadowColor: BRAND_PRIMARY,
        shadowOpacity: 0.3,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
    },
    ctaText: {
        fontSize: 17,
        fontWeight: "700",
        color: "#fff",
    },
    termsText: {
        fontSize: 12,
        color: "rgba(255,255,255,0.3)",
        textAlign: "center",
        marginTop: 16,
        lineHeight: 18,
    },
});

export default TestOnboardingScreen;
