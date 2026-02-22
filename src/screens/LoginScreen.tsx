import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { PRIVACY_URL, TERMS_URL } from "../constants/legalUrls";
import { useStore } from "../store/useStore";
import { COLORS } from "../constants/colors";
import { usePostHog } from "posthog-react-native";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { useAppleAuth } from "../hooks/useAppleAuth";
import { hashId } from "../utils/analytics";

const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const { login, isLoading, colors, themeMode } = useStore();
    const { signInWithGoogle, isGoogleLoading, isGoogleConfigured } = useGoogleAuth();
    const { signInWithApple, isAppleLoading, isAppleAvailable } = useAppleAuth();
    const posthog = usePostHog();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs");
            return;
        }

        const success = await login(email, password);
        if (!success) {
            posthog?.capture("login_failed", { method: 'email' });
            const storeError = useStore.getState().error;
            Alert.alert("Erreur", storeError || "Identifiants incorrects");
            return;
        }

        // Identify user in PostHog with HASHED ID for GDPR
        const userData = useStore.getState().user;
        const actualUser = userData?.user ?? userData;
        
        if (actualUser?.id) {
            const anonymousId = await hashId(actualUser.id);
            posthog?.identify(anonymousId, {
                user_tier: (actualUser as { tier?: string }).tier || "standard",
                is_authenticated: true,
            });
            posthog?.capture("login_success", { method: 'email' });
        }
        
        // Navigation is handled automatically by AppNavigator's conditional rendering
    };

    const handleForgotPassword = () => {
        Alert.alert(
            "À venir",
            "Le reset de mot de passe sera disponible bientôt.",
        );
    };

    const handleGoogleLogin = async () => {
        const result = await signInWithGoogle();
        if (!result.success && result.error) {
            Alert.alert("Google", result.error);
        }
    };

    const handleAppleLogin = async () => {
        const result = await signInWithApple();
        if (!result.success && result.error) {
            Alert.alert("Apple", result.error);
        }
    };

    const openLegalUrl = async (url: string) => {
        try {
            await WebBrowser.openBrowserAsync(url);
        } catch {
            Alert.alert("Erreur", "Impossible d'ouvrir ce lien.");
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={22}
                            color={colors.text}
                        />
                    </TouchableOpacity>

                    <View style={styles.logoContainer}>
                        <View style={[styles.iconCircle, { backgroundColor: colors.surfaceGlass }]}>
                            <Ionicons
                                name="beer"
                                size={28}
                                color={colors.primary}
                            />
                        </View>
                        <Text style={[styles.logoText, { color: colors.text }]}>MATCH</Text>
                    </View>

                    <View style={styles.formCard}>
                        <View style={styles.inputsGroup}>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                                placeholder="E-mail"
                                placeholderTextColor={colors.textMuted}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />

                            <View>
                                <TextInput
                                    style={[styles.input, styles.passwordInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                                    placeholder="Mot de passe"
                                    placeholderTextColor={colors.textMuted}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoComplete="password"
                                />
                                <TouchableOpacity
                                    style={styles.passwordToggle}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Ionicons
                                        name={
                                            showPassword
                                                ? "eye-off-outline"
                                                : "eye-outline"
                                        }
                                        size={20}
                                        color={colors.textMuted}
                                    />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                onPress={handleForgotPassword}
                                style={styles.forgotPasswordButton}
                            >
                                <Text style={[styles.forgotPasswordText, { color: colors.textMuted }]}>
                                    Mot de passe oublié ?
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.loginButton,
                                { backgroundColor: colors.primary, shadowColor: colors.primary },
                                isLoading && styles.loginButtonDisabled,
                            ]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            <Text style={styles.loginButtonText}>
                                {isLoading ? "Connexion..." : "Se connecter"}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.dividerRow}>
                            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                            <Text style={[styles.dividerText, { color: colors.textMuted }]}>
                                Ou continuer avec
                            </Text>
                            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                        </View>

                        <View style={styles.socialRow}>
                            <TouchableOpacity
                                style={[
                                    styles.socialButton,
                                    styles.googleButton,
                                    (!isGoogleConfigured || isGoogleLoading || isLoading) &&
                                        styles.loginButtonDisabled,
                                ]}
                                onPress={handleGoogleLogin}
                                disabled={!isGoogleConfigured || isGoogleLoading || isLoading}
                            >
                                <Ionicons
                                    name="logo-google"
                                    size={18}
                                    color={colors.textInverse}
                                />
                                <Text style={styles.socialText}>
                                    {isGoogleLoading ? "Google..." : "Google"}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.socialButton,
                                    styles.appleButton,
                                    (!isAppleAvailable || isAppleLoading || isLoading) &&
                                        styles.loginButtonDisabled,
                                ]}
                                onPress={handleAppleLogin}
                                disabled={!isAppleAvailable || isAppleLoading || isLoading}
                            >
                                <Ionicons
                                    name="logo-apple"
                                    size={20}
                                    color={colors.text}
                                />
                                <Text style={[styles.socialText, styles.socialTextLight]}>
                                    {isAppleLoading ? "Apple..." : "Apple"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.legalContainer}>
                    <Text style={[styles.legalText, { color: colors.textMuted }]}>
                        En continuant, tu acceptes nos
                        <Text
                            style={[styles.link, { color: colors.text }]}
                            onPress={() => void openLegalUrl(TERMS_URL)}
                        >
                            {" "}Conditions d'utilisation{" "}
                        </Text>
                        et notre
                        <Text
                            style={[styles.link, { color: colors.text }]}
                            onPress={() => void openLegalUrl(PRIVACY_URL)}
                        >
                            {" "}Politique de confidentialité
                        </Text>.
                    </Text>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surfaceGlass,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 32,
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 32,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    logoText: {
        fontSize: 28,
        fontWeight: "800",
        letterSpacing: 2,
    },
    formCard: {
        backgroundColor: "transparent",
        paddingBottom: 32,
        gap: 24,
    },
    inputsGroup: {
        gap: 16,
    },
    input: {
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingVertical: Platform.OS === "ios" ? 18 : 12,
        fontSize: 16,
        borderWidth: 1,
    },
    passwordInput: {
        paddingRight: 48,
    },
    passwordToggle: {
        position: "absolute",
        right: 18,
        top: Platform.OS === "ios" ? 18 : 12,
        height: 32,
        width: 32,
        alignItems: "center",
        justifyContent: "center",
    },
    forgotPasswordButton: {
        alignSelf: "flex-end",
    },
    forgotPasswordText: {
        fontSize: 13,
        fontWeight: "600",
    },
    loginButton: {
        borderRadius: 20,
        paddingVertical: 16,
        alignItems: "center",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
        elevation: 6,
    },
    loginButtonDisabled: {
        opacity: 0.8,
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    divider: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
    },
    dividerText: {
        fontSize: 11,
        letterSpacing: 1,
        textTransform: "uppercase",
        fontWeight: "600",
    },
    socialRow: {
        flexDirection: "row",
        gap: 12,
    },
    socialButton: {
        flex: 1,
        borderRadius: 16,
        paddingVertical: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    googleButton: {
        backgroundColor: COLORS.surfaceLight,
    },
    appleButton: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    socialText: {
        fontWeight: "700",
        color: COLORS.textInverse,
    },
    socialTextLight: {
        color: COLORS.text,
    },
    legalContainer: {
        paddingHorizontal: 32,
        paddingBottom: 24,
    },
    legalText: {
        fontSize: 12,
        textAlign: "center",
        lineHeight: 18,
    },
    link: {
        textDecorationLine: "underline",
    },
});

export default LoginScreen;
