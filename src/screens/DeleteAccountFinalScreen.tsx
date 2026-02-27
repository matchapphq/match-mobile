import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useStore } from "../store/useStore";
import { apiService } from "../services/api";
import { usePostHog } from "posthog-react-native";

type RouteParams = {
    DeleteAccountFinal: {
        reason: string;
        details?: string;
    };
};

const DeleteAccountFinalScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<RouteParams, "DeleteAccountFinal">>();
    const { colors, computedTheme: themeMode, logout } = useStore();
    const posthog = usePostHog();

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const { reason, details } = route.params || {};

    React.useEffect(() => {
        posthog?.capture("delete_account_final_step_reached", { reason });
    }, []);

    const handleBack = () => {
        posthog?.capture("delete_account_back_from_final");
        navigation.goBack();
    };

    const handleCancel = () => {
        posthog?.capture("delete_account_cancelled_final");
        navigation.navigate("Tab", { screen: "Profile" });
    };

    const handleDelete = async () => {
        if (!password.trim()) {
            Alert.alert("Mot de passe requis", "Saisis ton mot de passe pour confirmer.");
            return;
        }

        setIsDeleting(true);
        posthog?.capture("delete_account_execution_attempt", { reason });
        
        try {
            await apiService.deleteAccount({
                reason: reason || "Non spécifié",
                details: details,
                password: password,
            });
            
            posthog?.capture("delete_account_execution_success", { reason });
            
            await logout();
            navigation.reset({
                index: 0,
                routes: [{ name: "DeleteAccountSuccess" }],
            });
        } catch (error: any) {
            console.error("Delete account error:", error);
            const rawMessage =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Mot de passe incorrect ou erreur serveur.";
            const normalized = String(rawMessage).trim().toLowerCase();
            const errorMessage =
                normalized === "invalid password"
                    ? "Mot de passe incorrect."
                    : normalized === "password is required"
                      ? "Mot de passe requis."
                      : String(rawMessage);
            
            posthog?.capture("delete_account_execution_failed", { 
                reason, 
                error: errorMessage,
                status: error?.response?.status 
            });
            
            Alert.alert("Erreur", errorMessage);
            setIsDeleting(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={themeMode === "light" ? "dark-content" : "light-content"} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: colors.surfaceGlass }]}
                        onPress={handleBack}
                        activeOpacity={0.85}
                    >
                        <MaterialIcons name="arrow-back" size={22} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.stepIndicator, { color: colors.textMuted }]}>Étape 3 sur 3</Text>
                    <View style={{ width: 44 }} />
                </View>
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBarSegment, { backgroundColor: "#f47b25" }]} />
                    <View style={[styles.progressBarSegment, { backgroundColor: "#f47b25" }]} />
                    <View style={[styles.progressBarSegment, { backgroundColor: "#f47b25" }]} />
                </View>
            </View>

            {/* Main Content */}
            <View style={styles.mainContent}>
                {/* Lock Icon with Glow */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconGlow} />
                    <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
                        <MaterialIcons name="lock-open" size={40} color="#ef4444" />
                    </View>
                </View>

                <Text style={[styles.title, { color: colors.text }]}>Confirmer la désactivation</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                    Saisis ton mot de passe pour confirmer. Tu pourras réactiver le compte en te reconnectant pendant le délai prévu.
                </Text>

                {/* Password Input */}
                <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.inputIconLeft}>
                        <MaterialIcons name="lock" size={22} color={colors.textMuted} />
                    </View>
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Mot de passe"
                        placeholderTextColor={colors.textMuted}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity
                        style={styles.inputIconRight}
                        onPress={() => setShowPassword(!showPassword)}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons
                            name={showPassword ? "visibility-off" : "visibility"}
                            size={20}
                            color={colors.textMuted}
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.forgotPassword} activeOpacity={0.7}>
                    <Text style={[styles.forgotPasswordText, { color: colors.textMuted }]}>Mot de passe oublié ?</Text>
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: 24 + insets.bottom }]}>
                <TouchableOpacity
                    style={[styles.deleteButton, isDeleting && { opacity: 0.7 }]}
                    activeOpacity={0.9}
                    onPress={handleDelete}
                    disabled={isDeleting}
                >
                    {isDeleting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <MaterialIcons name="delete-forever" size={22} color="#fff" />
                            <Text style={styles.deleteButtonText}>DÉSACTIVER MON COMPTE</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} activeOpacity={0.7} onPress={handleCancel}>
                    <Text style={[styles.cancelButtonText, { color: colors.textMuted }]}>Annuler</Text>
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
        gap: 16,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    stepIndicator: {
        fontSize: 14,
        fontWeight: "500",
    },
    progressBarContainer: {
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 8,
    },
    progressBarSegment: {
        flex: 1,
        height: 4,
        borderRadius: 2,
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
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "rgba(239,68,68,0.15)",
    },
    iconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 1,
        borderColor: "rgba(239,68,68,0.2)",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#ef4444",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    title: {
        fontSize: 28,
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
        maxWidth: 280,
    },
    inputContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
    },
    inputIconLeft: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
    },
    inputIconRight: {
        marginLeft: 12,
        padding: 4,
    },
    forgotPassword: {
        width: "100%",
        alignItems: "flex-end",
        marginTop: 12,
    },
    forgotPasswordText: {
        fontSize: 12,
    },
    footer: {
        paddingHorizontal: 24,
        gap: 16,
    },
    deleteButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#dc2626",
        paddingVertical: 18,
        borderRadius: 16,
        shadowColor: "#dc2626",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    deleteButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    cancelButton: {
        alignItems: "center",
        paddingVertical: 12,
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: "500",
    },
});

export default DeleteAccountFinalScreen;
