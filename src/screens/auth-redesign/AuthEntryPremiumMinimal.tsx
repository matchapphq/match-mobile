import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Alert,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import Svg, { Polygon, Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { useNavigation } from "@react-navigation/native";
import { useStore } from "../../store/useStore";
import { useGoogleAuth } from "../../hooks/useGoogleAuth";
import { useAppleAuth } from "../../hooks/useAppleAuth";
import { PRIVACY_URL, TERMS_URL } from "../../constants/legalUrls";
import { analytics } from "../../services/analytics";

const { height, width } = Dimensions.get("window");

const AuthEntryPremiumMinimal = () => {
    const { colors } = useStore();
    const navigation = useNavigation<any>();
    const { signInWithGoogle, isGoogleLoading, isGoogleConfigured } = useGoogleAuth();
    const { signInWithApple, isAppleLoading, isAppleAvailable } = useAppleAuth();

    const handleRegister = () => {
        analytics.track('sign_up_started', { method: 'email' });
        navigation.navigate("Onboarding");
    };

    const handleLogin = () => {
        navigation.navigate("Login");
    };

    const handleSocial = async (provider: string) => {
        analytics.track('sign_up_started', { method: provider.toLowerCase() });
        if (provider === "Google") {
            const result = await signInWithGoogle();
            if (!result.success && result.error) {
                Alert.alert("Google", result.error);
            }
            return;
        }

        if (provider === "Apple") {
            const result = await signInWithApple();
            if (!result.success && result.error) {
                Alert.alert("Apple", result.error);
            }
            return;
        }

        Alert.alert("Info", `Connexion ${provider} indisponible.`);
    };

    const openLegalUrl = async (url: string) => {
        try {
            await WebBrowser.openBrowserAsync(url);
        } catch (error) {
            console.error("Failed to open legal URL:", url, error);
            Alert.alert("Erreur", "Impossible d'ouvrir ce lien.");
        }
    };

    return (
        <View style={styles.container}>
            {/* Subtly animated/layered background */}
            <LinearGradient
                colors={["#0b0b0f", "#08080c", "#050508"]}
                style={StyleSheet.absoluteFillObject}
            />
            
            {/* Subtle glow behind logo */}
            <View style={styles.glowCircle} />

            <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Svg width={56} height={56} viewBox="0 0 1080 1080">
                            <Polygon 
                                fill={colors.accent}
                                points="717.7 279.9 567.1 452.6 525.9 281 414.1 472.4 504.4 451.1 257.5 743.7 382.4 743.7 443 557.2 521.7 686.6 714.2 470.6 640.6 743.2 800.2 743.7 898.1 279.9 717.7 279.9" 
                            />
                            <Path 
                                fill={colors.accent}
                                d="M295.4,558.2l207.3-277.4-168.5-.9-2,6.2h0c-2.1,5.6-4.7,15.7-6,19.9-33.4,108.3-63.5,218-94.8,326.9l-39,131.5c-.3,1-.6,2-.9,3.1l-.2.7-9.4,31.8,210.3-273.5-96.8,31.6h0Z" 
                            />
                        </Svg>
                    </View>
                    <Text style={styles.brand}>MATCH</Text>
                    <Text style={styles.tagline}>L'expérience sportive ultime.</Text>
                </View>

                <View style={styles.bottomSection}>
                    <View style={styles.authContainer}>
                        <TouchableOpacity 
                            style={[styles.primaryButton, { backgroundColor: colors.primary }]} 
                            onPress={handleRegister} 
                            activeOpacity={0.8}
                        >
                            <Text style={styles.primaryButtonText}>Créer un compte</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={handleLogin}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.secondaryButtonText}>Se connecter</Text>
                        </TouchableOpacity>

                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>OU CONTINUER AVEC</Text>
                            <View style={styles.divider} />
                        </View>

                        <View style={styles.socialRow}>
                            <TouchableOpacity
                                style={[
                                    styles.socialButton,
                                    (!isGoogleConfigured || isGoogleLoading) && { opacity: 0.5 },
                                ]}
                                onPress={() => handleSocial("Google")}
                                disabled={!isGoogleConfigured || isGoogleLoading}
                                activeOpacity={0.8}
                            >
                                <View style={styles.socialIconBg}>
                                    <FontAwesome5 name="google" size={18} color="#0b0b0f" />
                                </View>
                                <Text style={styles.socialButtonText}>Google</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.socialButton,
                                    (!isAppleAvailable || isAppleLoading) && { opacity: 0.5 },
                                ]}
                                onPress={() => handleSocial("Apple")}
                                disabled={!isAppleAvailable || isAppleLoading}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.socialIconBg, { backgroundColor: '#000' }]}>
                                    <FontAwesome5 name="apple" size={20} color="#fff" />
                                </View>
                                <Text style={styles.socialButtonText}>Apple</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={styles.legalText}>
                        En continuant, vous acceptez nos{" "}
                        <Text style={styles.legalLink} onPress={() => openLegalUrl(TERMS_URL)}>
                            Conditions
                        </Text>{" "}
                        &{" "}
                        <Text style={styles.legalLink} onPress={() => openLegalUrl(PRIVACY_URL)}>
                            Politique de confidentialité
                        </Text>
                    </Text>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0b0b0f",
    },
    glowCircle: {
        position: 'absolute',
        top: -height * 0.1,
        alignSelf: 'center',
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: 'rgba(150, 219, 31, 0.03)',
        transform: [{ scaleX: 1.5 }],
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 28,
        justifyContent: "space-between",
    },
    header: {
        alignItems: "center",
        marginTop: height * 0.12,
    },
    logoContainer: {
        shadowColor: "#96DB1F",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 20,
    },
    brand: {
        color: "#fff",
        fontSize: 32,
        fontWeight: "900",
        letterSpacing: 6,
        textAlign: "center",
    },
    tagline: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 16,
        fontWeight: "400",
        marginTop: 12,
        letterSpacing: 0.5,
    },
    bottomSection: {
        marginBottom: Platform.OS === 'ios' ? 20 : 32,
        gap: 32,
    },
    authContainer: {
        gap: 16,
    },
    primaryButton: {
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#96DB1F",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 5,
    },
    primaryButtonText: {
        color: "#0b0b0f",
        fontSize: 18,
        fontWeight: "700",
        letterSpacing: 0.2,
    },
    secondaryButton: {
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.03)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },
    secondaryButtonText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "600",
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 12,
        paddingHorizontal: 10,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: "rgba(255,255,255,0.05)",
    },
    dividerText: {
        color: "rgba(255,255,255,0.3)",
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 1.5,
        marginHorizontal: 16,
    },
    socialRow: {
        flexDirection: "row",
        gap: 12,
    },
    socialButton: {
        flex: 1,
        flexDirection: "row",
        height: 60,
        borderRadius: 30,
        backgroundColor: "rgba(255,255,255,0.03)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        alignItems: "center",
        paddingHorizontal: 8,
    },
    socialIconBg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    socialButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
        marginLeft: 12,
    },
    legalText: {
        color: "rgba(255,255,255,0.35)",
        fontSize: 12,
        textAlign: "center",
        lineHeight: 18,
        paddingHorizontal: 20,
    },
    legalLink: {
        color: "rgba(255,255,255,0.6)",
        fontWeight: "500",
        textDecorationLine: "underline",
    },
});

export default AuthEntryPremiumMinimal;
