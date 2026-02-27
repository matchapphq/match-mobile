import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useStore } from "../store/useStore";
import { usePostHog } from "posthog-react-native";

const LOSS_ITEMS = [
    {
        icon: "pause-circle-outline",
        title: "Accès suspendu immédiatement",
        subtitle: "Votre compte sera désactivé dès confirmation",
    },
    {
        icon: "autorenew",
        title: "Réactivation possible",
        subtitle: "Reconnectez-vous pendant le délai prévu pour restaurer le compte",
    },
    {
        icon: "delete-forever",
        title: "Suppression définitive à la fin du délai",
        subtitle: "Passé ce délai, les données sont supprimées",
    },
];

const DeleteAccountWarningScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { colors, computedTheme: themeMode } = useStore();
    const posthog = usePostHog();

    React.useEffect(() => {
        posthog?.capture("delete_account_started");
    }, []);

    const handleClose = () => {
        posthog?.capture("delete_account_cancelled_warning", { method: "close_button" });
        navigation.goBack();
    };

    const handleKeepAccount = () => {
        posthog?.capture("delete_account_cancelled_warning", { method: "keep_account_button" });
        navigation.goBack();
    };

    const handleContinue = () => {
        posthog?.capture("delete_account_step_1_continued");
        navigation.navigate("DeleteAccountConfirm");
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={themeMode === "light" ? "dark-content" : "light-content"} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <TouchableOpacity
                    style={[styles.closeButton, { backgroundColor: colors.surfaceGlass }]}
                    onPress={handleClose}
                    activeOpacity={0.85}
                >
                    <MaterialIcons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.mainContent}>
                {/* Warning Icon with Glow */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconGlow} />
                    <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
                        <MaterialIcons name="warning" size={48} color="#ef4444" />
                    </View>
                </View>

                <Text style={[styles.title, { color: colors.text }]}>
                    Désactiver mon{"\n"}compte ?
                </Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                    Votre compte sera désactivé immédiatement. Vous pourrez le réactiver en vous reconnectant pendant le délai prévu.
                </Text>

                {/* Loss Cards */}
                <View style={styles.cardsList}>
                    {LOSS_ITEMS.map((item) => (
                        <View
                            key={item.title}
                            style={[styles.lossCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        >
                            <View style={styles.lossIconCircle}>
                                <MaterialIcons name={item.icon as any} size={22} color="#ef4444" />
                            </View>
                            <View style={styles.lossTextContainer}>
                                <Text style={[styles.lossTitle, { color: colors.text }]}>{item.title}</Text>
                                <Text style={[styles.lossSubtitle, { color: colors.textMuted }]}>{item.subtitle}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: 40 + insets.bottom }]}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    activeOpacity={0.9}
                    onPress={handleKeepAccount}
                >
                    <Text style={styles.primaryButtonText}>Garder mon compte</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.7} onPress={handleContinue}>
                    <Text style={styles.secondaryButtonText}>Continuer</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    mainContent: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        marginTop: -40,
    },
    iconContainer: {
        marginBottom: 32,
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },
    iconGlow: {
        position: "absolute",
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: "rgba(239,68,68,0.2)",
    },
    iconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
    },
    title: {
        fontSize: 30,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 40,
        paddingHorizontal: 16,
    },
    cardsList: {
        width: "100%",
        gap: 16,
    },
    lossCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    lossIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(239,68,68,0.1)",
    },
    lossTextContainer: {
        flex: 1,
    },
    lossTitle: {
        fontSize: 15,
        fontWeight: "500",
        marginBottom: 2,
    },
    lossSubtitle: {
        fontSize: 12,
    },
    footer: {
        paddingHorizontal: 24,
        gap: 16,
    },
    primaryButton: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: "center",
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
    secondaryButton: {
        alignItems: "center",
        paddingVertical: 12,
    },
    secondaryButtonText: {
        color: "rgba(248,113,113,0.8)",
        fontSize: 14,
        fontWeight: "500",
    },
});

export default DeleteAccountWarningScreen;
