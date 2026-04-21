import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Alert,
    Platform,
    ImageBackground,
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

const HERO_IMAGE = "https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=2669&auto=format&fit=crop";

const AuthEntryBottomSheet = () => {
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
            <ImageBackground source={{ uri: HERO_IMAGE }} style={styles.heroBackground}>
                <LinearGradient
                    colors={["rgba(11,11,15,0.2)", "rgba(11,11,15,0.8)", "#0b0b0f"]}
                    style={StyleSheet.absoluteFillObject}
                />
                
                <SafeAreaView style={styles.topContent} edges={["top"]}>
                    <View style={styles.logoWrapper}>
                        <Svg width={48} height={48} viewBox="0 0 1080 1080">
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
                </SafeAreaView>
            </ImageBackground>

            <View style={styles.bottomSheet}>
                <View style={styles.sheetHeader}>
                    <Text style={styles.sheetTitle}>Bienvenue sur Match</Text>
                    <Text style={styles.sheetSubtitle}>Trouvez les meilleurs spots pour voir vos matchs préférés.</Text>
                </View>

                <View style={styles.actionContainer}>
                    <TouchableOpacity 
                        style={[styles.primaryButton, { backgroundColor: colors.primary }]} 
                        onPress={handleRegister}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.primaryButtonText}>Créer un compte</Text>
                        <MaterialIcons name="chevron-right" size={24} color="#000" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.secondaryButton} 
                        onPress={handleLogin}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.secondaryButtonText}>J'ai déjà un compte</Text>
                    </TouchableOpacity>

                    <View style={styles.dividerRow}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerLabel}>OU</Text>
                        <View style={styles.divider} />
                    </View>

                    <View style={styles.socialGrid}>
                        <TouchableOpacity 
                            style={styles.socialItem}
                            onPress={() => handleSocial("Google")}
                            disabled={isGoogleLoading}
                            activeOpacity={0.8}
                        >
                            <View style={styles.socialIconContainer}>
                                <FontAwesome5 name="google" size={20} color="#EA4335" />
                            </View>
                            <Text style={styles.socialItemText}>Google</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.socialItem}
                            onPress={() => handleSocial("Apple")}
                            disabled={isAppleLoading}
                            activeOpacity={0.8}
                        >
                            <View style={styles.socialIconContainer}>
                                <FontAwesome5 name="apple" size={22} color="#fff" />
                            </View>
                            <Text style={styles.socialItemText}>Apple</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <SafeAreaView edges={["bottom"]}>
                    <Text style={styles.footerLegal}>
                        En rejoignant Match, vous acceptez nos{"\n"}
                        <Text style={styles.footerLink} onPress={() => openLegalUrl(TERMS_URL)}>Conditions d'utilisation</Text>
                    </Text>
                </SafeAreaView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0b0b0f",
    },
    heroBackground: {
        height: height * 0.55,
        width: '100%',
    },
    topContent: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 20,
    },
    logoWrapper: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: 'rgba(11,11,15,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(10px)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    bottomSheet: {
        flex: 1,
        backgroundColor: '#0b0b0f',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -40,
        paddingHorizontal: 28,
        paddingTop: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 20,
    },
    sheetHeader: {
        marginBottom: 32,
    },
    sheetTitle: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    sheetSubtitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 15,
        lineHeight: 22,
        marginTop: 8,
    },
    actionContainer: {
        gap: 16,
    },
    primaryButton: {
        height: 60,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    primaryButtonText: {
        color: '#000',
        fontSize: 17,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
        marginLeft: 24,
    },
    secondaryButton: {
        height: 60,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    secondaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    dividerLabel: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        fontWeight: '700',
        marginHorizontal: 16,
    },
    socialGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    socialItem: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.04)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    socialIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    socialItemText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 12,
    },
    footerLegal: {
        marginTop: 32,
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
    footerLink: {
        color: 'rgba(255,255,255,0.5)',
        textDecorationLine: 'underline',
    },
});

export default AuthEntryBottomSheet;
