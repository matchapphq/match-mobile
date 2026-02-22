import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    StatusBar,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useStore } from "../store/useStore";
import { apiService } from "../services/api";
import { usePostHog } from "posthog-react-native";

const ChangePasswordScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { colors, computedTheme: themeMode } = useStore();
    const posthog = usePostHog();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const passwordChecks = useMemo(() => {
        return {
            minLength: newPassword.length >= 8,
            hasNumber: /\d/.test(newPassword),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
        };
    }, [newPassword]);

    const passwordStrength = useMemo(() => {
        const checks = Object.values(passwordChecks).filter(Boolean).length;
        if (checks === 0) return { label: "", color: "transparent", width: "0%" };
        if (checks === 1) return { label: "Faible", color: "#ef4444", width: "33%" };
        if (checks === 2) return { label: "Moyen", color: "#f97316", width: "66%" };
        return { label: "Fort", color: "#22c55e", width: "100%" };
    }, [passwordChecks]);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleUpdatePassword = async () => {
        if (!currentPassword.trim()) {
            Alert.alert("Erreur", "Veuillez entrer votre mot de passe actuel.");
            return;
        }
        if (!newPassword.trim()) {
            Alert.alert("Erreur", "Veuillez entrer un nouveau mot de passe.");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
            return;
        }
        if (!passwordChecks.minLength) {
            Alert.alert("Erreur", "Le mot de passe doit contenir au moins 8 caractères.");
            return;
        }

        setIsLoading(true);
        try {
            await apiService.changePassword({
                currentPassword,
                newPassword,
            });
            posthog?.capture('password_change_success');
            Alert.alert("Succès", "Votre mot de passe a été mis à jour.", [
                { text: "OK", onPress: () => navigation.goBack() },
            ]);
        } catch (error: any) {
            console.error("Change password error:", error);
            const errorMessage =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Impossible de mettre à jour le mot de passe.";
            posthog?.capture('password_change_failed', { error: errorMessage });
            Alert.alert("Erreur", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={themeMode === "light" ? "dark-content" : "light-content"} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top, borderBottomColor: colors.border }]}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Sécurité</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.content, { paddingBottom: 40 + insets.bottom }]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Title Section */}
                    <View style={styles.titleSection}>
                        <Text style={[styles.title, { color: colors.text }]}>Modifier le mot de passe</Text>
                        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                            Choisissez un mot de passe fort pour protéger votre compte et vos accès aux matchs.
                        </Text>
                    </View>

                    {/* Current Password */}
                    <View style={styles.fieldGroup}>
                        <Text style={[styles.label, { color: colors.textMuted }]}>MOT DE PASSE ACTUEL</Text>
                        <View style={[styles.inputContainer, { borderBottomColor: colors.border }]}>
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Entrez votre mot de passe actuel"
                                placeholderTextColor={colors.textMuted}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry={!showCurrentPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <TouchableOpacity
                                style={styles.visibilityButton}
                                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                activeOpacity={0.7}
                            >
                                <MaterialIcons
                                    name={showCurrentPassword ? "visibility" : "visibility-off"}
                                    size={20}
                                    color="#a1a1aa"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* New Password */}
                    <View style={[styles.fieldGroup, { marginTop: 8 }]}>
                        <Text style={[styles.label, { color: colors.textMuted }]}>NOUVEAU MOT DE PASSE</Text>
                        <View style={[styles.inputContainer, { borderBottomColor: colors.border }]}>
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Entrez votre nouveau mot de passe"
                                placeholderTextColor={colors.textMuted}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showNewPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <TouchableOpacity
                                style={styles.visibilityButton}
                                onPress={() => setShowNewPassword(!showNewPassword)}
                                activeOpacity={0.7}
                            >
                                <MaterialIcons
                                    name={showNewPassword ? "visibility" : "visibility-off"}
                                    size={20}
                                    color="#a1a1aa"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Password Strength */}
                        {newPassword.length > 0 && (
                            <View style={styles.strengthContainer}>
                                <View style={styles.strengthTrack}>
                                    <View
                                        style={[
                                            styles.strengthFill,
                                            { width: passwordStrength.width as any, backgroundColor: passwordStrength.color },
                                        ]}
                                    />
                                </View>
                                <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                                    {passwordStrength.label}
                                </Text>
                            </View>
                        )}

                        {/* Password Requirements */}
                        <View style={styles.requirementsList}>
                            <View style={styles.requirementItem}>
                                <MaterialIcons
                                    name={passwordChecks.minLength ? "check-circle" : "radio-button-unchecked"}
                                    size={14}
                                    color={passwordChecks.minLength ? "#22c55e" : "#a1a1aa"}
                                />
                                <Text
                                    style={[
                                        styles.requirementText,
                                        { color: passwordChecks.minLength ? "#22c55e" : "#a1a1aa" },
                                    ]}
                                >
                                    Au moins 8 caractères
                                </Text>
                            </View>
                            <View style={styles.requirementItem}>
                                <MaterialIcons
                                    name={passwordChecks.hasNumber ? "check-circle" : "radio-button-unchecked"}
                                    size={14}
                                    color={passwordChecks.hasNumber ? "#22c55e" : "#a1a1aa"}
                                />
                                <Text
                                    style={[
                                        styles.requirementText,
                                        { color: passwordChecks.hasNumber ? "#22c55e" : "#a1a1aa" },
                                    ]}
                                >
                                    Un chiffre requis
                                </Text>
                            </View>
                            <View style={styles.requirementItem}>
                                <MaterialIcons
                                    name={passwordChecks.hasSpecial ? "check-circle" : "radio-button-unchecked"}
                                    size={14}
                                    color={passwordChecks.hasSpecial ? "#22c55e" : "#a1a1aa"}
                                />
                                <Text
                                    style={[
                                        styles.requirementText,
                                        { color: passwordChecks.hasSpecial ? "#22c55e" : "#a1a1aa" },
                                    ]}
                                >
                                    Un caractère spécial
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Confirm Password */}
                    <View style={[styles.fieldGroup, { marginTop: 8 }]}>
                        <Text style={[styles.label, { color: colors.textMuted }]}>CONFIRMER LE MOT DE PASSE</Text>
                        <View style={[styles.inputContainer, { borderBottomColor: colors.border }]}>
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Répétez le nouveau mot de passe"
                                placeholderTextColor={colors.textMuted}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                    </View>

                    {/* Submit Button */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.submitButton, isLoading && { opacity: 0.7 }]}
                            activeOpacity={0.9}
                            onPress={handleUpdatePassword}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Mettre à jour le mot de passe</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.forgotPasswordLink} activeOpacity={0.7}>
                            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    titleSection: {
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: "#a1a1aa",
        lineHeight: 22,
    },
    fieldGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 11,
        fontWeight: "700",
        color: "#a1a1aa",
        letterSpacing: 1,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
    },
    input: {
        flex: 1,
        fontSize: 18,
        paddingVertical: 12,
    },
    visibilityButton: {
        padding: 8,
    },
    strengthContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
        gap: 8,
    },
    strengthTrack: {
        flex: 1,
        height: 4,
        backgroundColor: "rgba(120,120,128,0.16)",
        borderRadius: 2,
        overflow: "hidden",
    },
    strengthFill: {
        height: "100%",
        borderRadius: 2,
    },
    strengthLabel: {
        fontSize: 12,
        fontWeight: "500",
    },
    requirementsList: {
        marginTop: 16,
        gap: 8,
    },
    requirementItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    requirementText: {
        fontSize: 12,
    },
    footer: {
        marginTop: 40,
    },
    submitButton: {
        backgroundColor: "#f47b25",
        paddingVertical: 16,
        borderRadius: 9999,
        alignItems: "center",
        shadowColor: "#f47b25",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    forgotPasswordLink: {
        alignItems: "center",
        marginTop: 24,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: "#a1a1aa",
        textDecorationLine: "underline",
    },
});

export default ChangePasswordScreen;
