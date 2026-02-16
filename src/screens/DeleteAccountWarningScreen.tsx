import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useStore } from "../store/useStore";

const LOSS_ITEMS = [
    {
        icon: "history",
        title: "Historique des matchs",
        subtitle: "Vos statistiques et scores passés",
    },
    {
        icon: "social_leaderboard",
        title: "Points Social Sport",
        subtitle: "Votre rang et progression",
    },
    {
        icon: "emoji_events",
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

            <View style={styles.header}> 
                <TouchableOpacity
                    style={[styles.closeButton, { marginTop: insets.top, backgroundColor: "rgba(255,255,255,0.08)" }]}
                    onPress={handleClose}
                    activeOpacity={0.85}
                >
                    <MaterialIcons name="close" size={22} color={colors.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.contentWrapper}>
                <View style={styles.warningIconWrapper}>
                    <LinearGradient
                        colors={["rgba(239,68,68,0.45)", "rgba(0,0,0,0)"]}
                        style={styles.warningGlow}
                    />
                    <View style={[styles.warningIcon, { backgroundColor: colors.surface }]}> 
                        <MaterialIcons name="warning" size={44} color="#fb7185" />
                    </View>
                </View>

                <Text style={[styles.title, { color: colors.text }]}>Supprimer mon compte ?</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>Cette action est irréversible. Si tu continues, tu perdras définitivement l'accès aux éléments suivants :</Text>

                <View style={styles.lossList}>
                    {LOSS_ITEMS.map((item) => (
                        <View key={item.title} style={[styles.lossCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
                            <View style={styles.lossIconCircle}>
                                <MaterialIcons name={item.icon as any} size={22} color="#fb7185" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.lossTitle, { color: colors.text }]}>{item.title}</Text>
                                <Text style={[styles.lossSubtitle, { color: colors.textMuted }]}>{item.subtitle}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            <View style={[styles.footer, { paddingBottom: 28 + insets.bottom }]}> 
                <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                    activeOpacity={0.92}
                    onPress={handleKeepAccount}
                >
                    <Text style={styles.primaryButtonText}>Garder mon compte</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.75} onPress={handleContinue}>
                    <Text style={[styles.secondaryAction, { color: "#fb7185" }]}>Continuer la suppression</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        width: "100%",
        alignItems: "flex-start",
    },
    closeButton: {
        alignSelf: "flex-start",
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    contentWrapper: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
    },
    warningIconWrapper: {
        marginBottom: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    warningGlow: {
        position: "absolute",
        width: 160,
        height: 160,
        borderRadius: 80,
        opacity: 0.8,
    },
    warningIcon: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        textAlign: "center",
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 28,
    },
    lossList: {
        width: "100%",
        gap: 14,
    },
    lossCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
    },
    lossIconCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        marginRight: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(248,113,113,0.12)",
    },
    lossTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    lossSubtitle: {
        fontSize: 12,
    },
    footer: {
        gap: 16,
    },
    primaryButton: {
        paddingVertical: 18,
        borderRadius: 28,
        alignItems: "center",
        shadowColor: "#f47b25",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
    },
    primaryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    secondaryAction: {
        fontSize: 14,
        textAlign: "center",
    },
});

export default DeleteAccountWarningScreen;
