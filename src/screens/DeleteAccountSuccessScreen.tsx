import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useStore } from "../store/useStore";
import { usePostHog } from "posthog-react-native";

const DeleteAccountSuccessScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { colors, computedTheme: themeMode } = useStore();
    const posthog = usePostHog();

    React.useEffect(() => {
        posthog?.capture("delete_account_success_screen_view");
    }, []);

    const handleReturnHome = () => {
        posthog?.capture("delete_account_return_to_auth");
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: "AuthEntry" }],
            })
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={themeMode === "light" ? "dark-content" : "light-content"} />

            {/* Background Glow */}
            <View style={styles.backgroundGlow} />

            {/* Main Content */}
            <View style={styles.mainContent}>
                {/* Logo Section */}
                <View style={styles.logoSection}>
                    <LinearGradient
                        colors={["#f47b25", "#fb923c"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.logoBox}
                    >
                        <MaterialIcons name="sports-bar" size={40} color="#fff" />
                    </LinearGradient>
                    <Text style={[styles.logoText, { color: colors.text }]}>MATCH</Text>
                </View>

                {/* Message */}
                <View style={styles.messageSection}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        Compte désactivé
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                        Vos données seront conservées pendant le délai de réactivation. Reconnectez-vous avant son expiration pour réactiver votre compte.
                    </Text>
                </View>

                {/* Dots Indicator */}
                <View style={styles.dotsContainer}>
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                </View>
            </View>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: 48 + insets.bottom }]}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    activeOpacity={0.9}
                    onPress={handleReturnHome}
                >
                    <Text style={styles.primaryButtonText}>Retour à l'accueil</Text>
                    <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundGlow: {
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 500,
        height: 500,
        marginLeft: -250,
        marginTop: -250,
        borderRadius: 250,
        backgroundColor: "rgba(244,123,37,0.05)",
        opacity: 0.8,
    },
    mainContent: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    logoSection: {
        alignItems: "center",
        marginBottom: 48,
    },
    logoBox: {
        width: 80,
        height: 80,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
        transform: [{ rotate: "3deg" }],
        shadowColor: "#f47b25",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 12,
    },
    logoText: {
        fontSize: 28,
        fontWeight: "800",
        letterSpacing: 8,
    },
    messageSection: {
        alignItems: "center",
        maxWidth: 280,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 16,
        lineHeight: 32,
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
    },
    dotsContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 48,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: "rgba(120,120,128,0.2)",
    },
    footer: {
        paddingHorizontal: 24,
    },
    primaryButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: "#f47b25",
        shadowColor: "#f47b25",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    primaryButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },
});

export default DeleteAccountSuccessScreen;
