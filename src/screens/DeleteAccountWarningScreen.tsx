import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useStore } from "../store/useStore";

const LOSS_ITEMS = [
    {
        icon: "history",
        title: "Historique des matchs",
        subtitle: "Vos statistiques et scores passés",
    },
    {
        icon: "leaderboard",
        title: "Points Social Sport",
        subtitle: "Votre rang et progression",
    },
    {
        icon: "emoji-events",
        title: "Badges débloqués",
        subtitle: "Toutes vos récompenses",
    },
];

const DeleteAccountWarningScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { colors, themeMode } = useStore();

    const handleClose = () => {
        navigation.goBack();
    };

    const handleKeepAccount = () => {
        navigation.goBack();
    };

    const handleContinue = () => {
        navigation.navigate("DeleteAccountConfirm");
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={themeMode === "light" ? "dark-content" : "light-content"} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <TouchableOpacity
                    style={styles.closeButton}
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
                    Supprimer mon{"\n"}compte ?
                </Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                    Cette action est irréversible. Si vous continuez, vous perdrez définitivement l'accès aux éléments suivants :
                </Text>

                {/* Loss Cards */}
                <View style={styles.cardsList}>
                    {LOSS_ITEMS.map((item) => (
                        <View
                            key={item.title}
                            style={[styles.lossCard, { backgroundColor: colors.surface, borderColor: "rgba(255,255,255,0.05)" }]}
                        >
                            <View style={styles.lossIconCircle}>
                                <MaterialIcons name={item.icon as any} size={22} color="#ef4444" />
                            </View>
                            <View style={styles.lossTextContainer}>
                                <Text style={[styles.lossTitle, { color: colors.text }]}>{item.title}</Text>
                                <Text style={[styles.lossSubtitle, { color: "rgba(255,255,255,0.4)" }]}>{item.subtitle}</Text>
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
                    <Text style={styles.secondaryButtonText}>Continuer la suppression</Text>
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
        backgroundColor: "rgba(255,255,255,0.05)",
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
        borderColor: "rgba(255,255,255,0.05)",
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
