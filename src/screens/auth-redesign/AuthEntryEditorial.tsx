import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import Svg, { Polygon, Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { useNavigation } from "@react-navigation/native";
import { useStore } from "../../store/useStore";
import { useGoogleAuth } from "../../hooks/useGoogleAuth";
import { useAppleAuth } from "../../hooks/useAppleAuth";
import { PRIVACY_URL, TERMS_URL } from "../../constants/legalUrls";
import { analytics } from "../../services/analytics";

const { height } = Dimensions.get("window");

const AuthEntryEditorial = () => {
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
            <LinearGradient
                colors={["#000", "#0b0b0f", "#1a1a20"]}
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.topSection}>
                    <View style={styles.logoRow}>
                        <Svg width={64} height={64} viewBox="0 0 1080 1080">
                            <Polygon 
                                fill={colors.accent}
                                points="717.7 279.9 567.1 452.6 525.9 281 414.1 472.4 504.4 451.1 257.5 743.7 382.4 743.7 443 557.2 521.7 686.6 714.2 470.6 640.6 743.2 800.2 743.7 898.1 279.9 717.7 279.9" 
                            />
                            <Path 
                                fill={colors.accent}
                                d="M295.4,558.2l207.3-277.4-168.5-.9-2,6.2h0c-2.1,5.6-4.7,15.7-6,19.9-33.4,108.3-63.5,218-94.8,326.9l-39,131.5c-.3,1-.6,2-.9,3.1l-.2.7-9.4,31.8,210.3-273.5-96.8,31.6h0Z" 
                            />
                        </Svg>
                        <View style={styles.logoLine} />
                    </View>

                    <View style={styles.textBlock}>
                        <Text style={styles.editorialTitle}>MATCH</Text>
                        <Text style={styles.editorialHeadline}>RÉSERVEZ. VIBREZ. GAGNEZ.</Text>
                        <Text style={styles.editorialSubline}>
                            La première plateforme de réservation pensée pour les passionnés de sport.
                        </Text>
                    </View>
                </View>

                <View style={styles.bottomSection}>
                    <View style={styles.primaryActions}>
                        <TouchableOpacity 
                            style={[styles.buttonPrimary, { backgroundColor: colors.accent }]} 
                            onPress={handleRegister}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonPrimaryText}>DÉMARRER L'AVENTURE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.buttonSecondary} 
                            onPress={handleLogin}
                            activeOpacity={0.6}
                        >
                            <Text style={styles.buttonSecondaryText}>S'IDENTIFIER</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.socialSection}>
                        <Text style={styles.socialTitle}>CONTINUER AVEC</Text>
                        <View style={styles.socialIcons}>
                            <TouchableOpacity 
                                style={styles.iconButton}
                                onPress={() => handleSocial("Google")}
                                disabled={isGoogleLoading}
                            >
                                <FontAwesome5 name="google" size={20} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.iconButton}
                                onPress={() => handleSocial("Apple")}
                                disabled={isAppleLoading}
                            >
                                <FontAwesome5 name="apple" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.legalBlock}>
                        <Text style={styles.legalText}>
                            En utilisant Match, vous acceptez nos{" "}
                            <Text style={styles.legalBold} onPress={() => openLegalUrl(TERMS_URL)}>CGU</Text>
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 32,
    },
    topSection: {
        flex: 1,
        justifyContent: 'center',
        paddingTop: 40,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginBottom: 40,
    },
    logoLine: {
        flex: 1,
        height: 2,
        backgroundColor: 'rgba(150, 219, 31, 0.2)',
    },
    textBlock: {
        gap: 8,
    },
    editorialTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 10,
        opacity: 0.5,
    },
    editorialHeadline: {
        color: '#fff',
        fontSize: 48,
        fontWeight: '900',
        lineHeight: 52,
        letterSpacing: -1,
    },
    editorialSubline: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 18,
        lineHeight: 28,
        marginTop: 12,
        fontWeight: '400',
    },
    bottomSection: {
        paddingBottom: 40,
        gap: 48,
    },
    primaryActions: {
        gap: 16,
    },
    buttonPrimary: {
        height: 72,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonPrimaryText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 2,
    },
    buttonSecondary: {
        height: 72,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    buttonSecondaryText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 2,
    },
    socialSection: {
        alignItems: 'center',
        gap: 20,
    },
    socialTitle: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 3,
    },
    socialIcons: {
        flexDirection: 'row',
        gap: 32,
        alignItems: 'center',
    },
    iconButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    legalBlock: {
        alignItems: 'center',
    },
    legalText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        letterSpacing: 0.5,
    },
    legalBold: {
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
});

export default AuthEntryEditorial;
