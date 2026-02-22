import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Dimensions,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { useNavigation } from "@react-navigation/native";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { useAppleAuth } from "../hooks/useAppleAuth";
import { PRIVACY_URL, TERMS_URL } from "../constants/legalUrls";

const HERO_IMAGE =
    "https://images.unsplash.com/photo-1572116469696-958721b7d6ca?q=80&w=2574&auto=format&fit=crop";
const BRAND_PRIMARY = "#f47b25";
const { width } = Dimensions.get("window");

const AuthEntryScreen = () => {
    const navigation = useNavigation<any>();
    const { signInWithGoogle, isGoogleLoading, isGoogleConfigured } = useGoogleAuth();
    const { signInWithApple, isAppleLoading, isAppleAvailable } = useAppleAuth();

    const handleRegister = () => {
        navigation.navigate("Onboarding");
    };

    const handleLogin = () => {
        navigation.navigate("Login");
    };

    const handleSocial = async (provider: string) => {
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
        } catch {
            Alert.alert("Erreur", "Impossible d'ouvrir ce lien.");
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={{ uri: HERO_IMAGE }}
                style={styles.background}
                resizeMode="cover"
            >
                <LinearGradient
                    colors={["rgba(11,11,15,0.95)", "rgba(11,11,15,0.9)", "rgba(11,11,15,0.8)"]}
                    style={StyleSheet.absoluteFillObject}
                />
                <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
                    <View style={styles.header}>
                        <MaterialIcons name="sports-bar" size={30} color={BRAND_PRIMARY} />
                        <Text style={styles.brand}>MATCH</Text>
                    </View>
                    <Text style={styles.tagline}>Trouve ton spot, vis le match.</Text>

                    <View style={styles.card}>
                        <View style={styles.buttonGroup}>
                            <TouchableOpacity style={[styles.primaryButton]} onPress={handleRegister} activeOpacity={0.9}>
                                <Text style={styles.primaryButtonText}>Créer un compte</Text>
                                <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={handleLogin}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.secondaryButtonText}>Se connecter</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dividerRow}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerLabel}>OU CONTINUER AVEC</Text>
                            <View style={styles.divider} />
                        </View>

                        <View style={styles.socialRow}>
                            <TouchableOpacity
                                style={[
                                    styles.socialButton,
                                    styles.socialPrimary,
                                    (!isGoogleConfigured || isGoogleLoading) && { opacity: 0.5 },
                                ]}
                                onPress={() => handleSocial("Google")}
                                disabled={!isGoogleConfigured || isGoogleLoading}
                                activeOpacity={0.9}
                            >
                                <FontAwesome5 name="google" size={16} color="#0b0b0f" />
                                <Text style={[styles.socialLabel, styles.socialLabelDark]}>
                                    {isGoogleLoading ? "Google..." : "Google"}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.socialButton,
                                    styles.socialSecondary,
                                    (!isAppleAvailable || isAppleLoading) && { opacity: 0.5 },
                                ]}
                                onPress={() => handleSocial("Apple")}
                                disabled={!isAppleAvailable || isAppleLoading}
                                activeOpacity={0.9}
                            >
                                <FontAwesome5 name="apple" size={18} color="#ffffff" />
                                <Text style={[styles.socialLabel, styles.socialLabelLight]}>
                                    {isAppleLoading ? "Apple..." : "Apple"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.terms}>
                            En continuant, tu acceptes nos{" "}
                            <Text
                                style={styles.link}
                                onPress={() => void openLegalUrl(TERMS_URL)}
                            >
                                Conditions d'utilisation
                            </Text>{" "}
                            et notre{" "}
                            <Text
                                style={styles.link}
                                onPress={() => void openLegalUrl(PRIVACY_URL)}
                            >
                                Politique de confidentialité
                            </Text>.
                        </Text>
                    </View>
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0b0b0f",
    },
    background: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 24,
        paddingBottom: 32,
        justifyContent: "space-between",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 16,
    },
    brand: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "800",
        letterSpacing: 3,
    },
    tagline: {
        textAlign: "center",
        color: "rgba(255,255,255,0.7)",
        fontSize: 14,
        marginTop: 8,
    },
    card: {
        width: "100%",
        maxWidth: 420,
        alignSelf: "center",
        backgroundColor: "rgba(26,18,11,0.85)",
        borderRadius: 28,
        padding: 24,
        gap: 24,
        shadowColor: "#000",
        shadowOpacity: 0.5,
        shadowRadius: 30,
        shadowOffset: { width: 0, height: 20 },
    },
    buttonGroup: {
        gap: 16,
    },
    primaryButton: {
        backgroundColor: BRAND_PRIMARY,
        borderRadius: 20,
        height: 60,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        shadowColor: BRAND_PRIMARY,
        shadowOpacity: 0.4,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
    },
    primaryButtonText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "700",
    },
    secondaryButton: {
        backgroundColor: "#1c1c21",
        borderRadius: 20,
        height: 60,
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    divider: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: "rgba(255,255,255,0.1)",
    },
    dividerLabel: {
        fontSize: 10,
        letterSpacing: 3,
        color: "rgba(255,255,255,0.5)",
    },
    socialRow: {
        flexDirection: "row",
        gap: 12,
    },
    socialButton: {
        flex: 1,
        height: 54,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        flexDirection: "row",
        gap: 8,
    },
    socialPrimary: {
        backgroundColor: "#fff",
        borderColor: "#fff",
    },
    socialSecondary: {
        backgroundColor: "#1c1c21",
    },
    socialLabel: {
        fontSize: 16,
        fontWeight: "600",
    },
    socialLabelDark: {
        color: "#0b0b0f",
    },
    socialLabelLight: {
        color: "#ffffff",
    },
    terms: {
        fontSize: 12,
        textAlign: "center",
        color: "rgba(255,255,255,0.6)",
        lineHeight: 18,
        marginTop: 4,
    },
    link: {
        textDecorationLine: "underline",
        color: "#fff",
    },
});

export default AuthEntryScreen;
