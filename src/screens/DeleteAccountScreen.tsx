import React, { useState, useRef, useEffect, useMemo } from "react";
import {
    View, Text, StyleSheet, StatusBar, TouchableOpacity,
    TextInput, ScrollView, Alert, ActivityIndicator, useWindowDimensions, Animated
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useStore } from "../store/useStore";
import { apiService } from "../services/api";
import { usePostHog } from "posthog-react-native";
import { COLORS } from "../constants/colors";

type RouteParams = {
    DeleteAccount: {
        accountDeletionGraceDays?: number;
    };
};

const formatGraceDaysLabel = (days: number | null | undefined) =>
    typeof days === "number" && days > 0 ? `${days} jour${days > 1 ? "s" : ""}` : "le délai prévu";

const REASONS = [
    "Je reçois trop de notifications",
    "Je n'utilise plus l'application",
    "Il manque des fonctionnalités",
    "Problèmes techniques / Bugs",
    "Autre raison",
];

const DeleteAccountScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<RouteParams, "DeleteAccount">>();
    const { colors, computedTheme: themeMode, logout, user } = useStore();
    const posthog = usePostHog();
    const { width } = useWindowDimensions();
    
    const scrollViewRef = useRef<ScrollView>(null);
    const [step, setStep] = useState(1);

    const [accountDeletionGraceDays, setAccountDeletionGraceDays] = useState<number | null>(
        typeof route.params?.accountDeletionGraceDays === "number" && route.params.accountDeletionGraceDays > 0
            ? route.params.accountDeletionGraceDays
            : null
    );

    const graceDaysLabel = formatGraceDaysLabel(accountDeletionGraceDays);

    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [details, setDetails] = useState("");

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Bypass logic
    const actualUser = user?.user ?? user;
    const isUserRole = actualUser?.role === "user";
    const isSocialAuth = actualUser?.auth_provider === "google" || actualUser?.auth_provider === "apple";
    const isBypassActive = isUserRole && isSocialAuth;

    useEffect(() => {
        posthog?.capture("delete_account_started");
        let isMounted = true;
        apiService
            .getPrivacyPreferences()
            .then((preferences) => {
                if (!isMounted) return;
                const days = preferences?.account_deletion_grace_days;
                setAccountDeletionGraceDays(
                    Number.isFinite(days) && days > 0 ? days : null
                );
            })
            .catch(() => undefined);
        return () => { isMounted = false; };
    }, []);

    const goToStep = (nextStep: number) => {
        setStep(nextStep);
        scrollViewRef.current?.scrollTo({ x: (nextStep - 1) * width, animated: true });
    };

    const handleBack = () => {
        if (step > 1) {
            goToStep(step - 1);
        } else {
            posthog?.capture("delete_account_cancelled_warning", { method: "close_button" });
            navigation.goBack();
        }
    };

    const handleKeepAccount = () => {
        posthog?.capture("delete_account_cancelled_warning", { method: "keep_account_button" });
        navigation.goBack();
    };

    const handleContinueStep1 = () => {
        posthog?.capture("delete_account_step_1_continued");
        goToStep(2);
    };

    const handleContinueStep2 = () => {
        if (!selectedReason) {
            Alert.alert("Raison requise", "Merci de sélectionner une raison.");
            return;
        }
        posthog?.capture("delete_account_step_2_continued", {
            reason: selectedReason,
            has_details: !!details.trim(),
        });
        goToStep(3);
        posthog?.capture("delete_account_final_step_reached", { 
            reason: selectedReason,
            is_social_auth: isSocialAuth,
            is_user_role: isUserRole,
            is_bypass_active: isBypassActive
        });
    };

    const handleDelete = async () => {
        if (!isBypassActive && !password.trim()) {
            Alert.alert("Mot de passe requis", "Saisis ton mot de passe pour confirmer.");
            return;
        }

        setIsDeleting(true);
        posthog?.capture("delete_account_execution_attempt", { 
            reason: selectedReason,
            is_social_auth: isSocialAuth,
            is_bypass_active: isBypassActive
        });
        
        try {
            await apiService.deleteAccount({
                reason: selectedReason || "Non spécifié",
                details: details.trim() || undefined,
                password: isBypassActive ? "" : password,
            });
            
            posthog?.capture("delete_account_execution_success", { reason: selectedReason });
            await logout();
            navigation.reset({
                index: 0,
                routes: [{ name: "DeleteAccountSuccess", params: { accountDeletionGraceDays } }],
            });
        } catch (error: any) {
            console.error("Delete account error:", error);
            const rawMessage =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Une erreur est survenue lors de la désactivation.";
            const normalized = String(rawMessage).trim().toLowerCase();
            const errorMessage =
                normalized === "invalid password"
                    ? "Mot de passe incorrect."
                    : normalized === "password is required"
                      ? "Mot de passe requis."
                      : String(rawMessage);
            
            posthog?.capture("delete_account_execution_failed", { 
                reason: selectedReason, 
                error: errorMessage,
                status: error?.response?.status 
            });
            
            Alert.alert("Erreur", errorMessage);
            setIsDeleting(false);
        }
    };

    const lossItems = useMemo(() => [
        { icon: "pause-circle-outline", title: "Accès suspendu immédiatement", subtitle: "Votre compte sera désactivé dès confirmation" },
        { icon: "autorenew", title: "Réactivation possible", subtitle: `Reconnectez-vous sous ${graceDaysLabel} pour restaurer le compte` },
        { icon: "delete-forever", title: `Suppression définitive après ${graceDaysLabel}`, subtitle: "Passé ce délai, les données sont supprimées" },
    ], [graceDaysLabel]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={themeMode === "light" ? "dark-content" : "light-content"} />

            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: colors.surfaceGlass }]}
                        onPress={handleBack}
                        activeOpacity={0.85}
                    >
                        <MaterialIcons name={step === 1 ? "close" : "arrow-back"} size={22} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.stepIndicator, { color: colors.textMuted }]}>Étape {step} sur 3</Text>
                    <View style={{ width: 44 }} />
                </View>
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBarSegment, { backgroundColor: step >= 1 ? colors.accent : colors.border }]} />
                    <View style={[styles.progressBarSegment, { backgroundColor: step >= 2 ? colors.accent : colors.border }]} />
                    <View style={[styles.progressBarSegment, { backgroundColor: step >= 3 ? colors.accent : colors.border }]} />
                </View>
            </View>

            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                {/* Step 1: Warning */}
                <View style={{ width, flex: 1 }}>
                    <View style={styles.mainContent}>
                        <View style={styles.iconContainer}>
                            <View style={styles.iconGlowWarning} />
                            <View style={[styles.iconCircle, { backgroundColor: colors.surface, borderColor: "rgba(0,0,0,0.05)" }]}>
                                <MaterialIcons name="warning" size={48} color="#ef4444" />
                            </View>
                        </View>
                        <Text style={[styles.title, { color: colors.text }]}>Désactiver mon{"\n"}compte ?</Text>
                        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                            {`Votre compte sera désactivé immédiatement. Vous pourrez le réactiver en vous reconnectant pendant ${graceDaysLabel}.`}
                        </Text>
                        <View style={styles.cardsList}>
                            {lossItems.map((item) => (
                                <View key={item.title} style={[styles.lossCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
                    <View style={[styles.footer, { paddingBottom: 40 + insets.bottom }]}>
                        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9} onPress={handleKeepAccount}>
                            <Text style={styles.primaryButtonText}>Garder mon compte</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.7} onPress={handleContinueStep1}>
                            <Text style={styles.secondaryButtonText}>Continuer</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Step 2: Confirm Reason */}
                <View style={{ width, flex: 1 }}>
                    <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]} showsVerticalScrollIndicator={false}>
                        <Text style={[styles.title, { color: colors.text }]}>Pourquoi nous quittez-vous ?</Text>
                        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Votre avis est précieux pour nous aider à nous améliorer.</Text>
                        <View style={styles.reasonsList}>
                            {REASONS.map((reason) => {
                                const isSelected = selectedReason === reason;
                                return (
                                    <TouchableOpacity
                                        key={reason}
                                        style={[
                                            styles.reasonCard,
                                            { backgroundColor: colors.surface, borderColor: isSelected ? colors.accent : colors.border },
                                            isSelected && { backgroundColor: colors.accent10 },
                                        ]}
                                        activeOpacity={0.85}
                                        onPress={() => setSelectedReason(reason)}
                                    >
                                        <Text style={[styles.reasonText, { color: colors.text }]}>{reason}</Text>
                                        <View style={[styles.radioCircle, { borderColor: isSelected ? colors.accent : colors.textMuted }, isSelected && { backgroundColor: colors.accent }]}>
                                            {isSelected && <View style={styles.radioInner} />}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <View style={styles.detailsSection}>
                            <Text style={[styles.detailsLabel, { color: colors.textMuted }]}>Détails supplémentaires (optionnel)</Text>
                            <TextInput
                                style={[styles.detailsInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                                placeholder="Dites-nous en plus..."
                                placeholderTextColor={colors.textMuted}
                                value={details}
                                onChangeText={setDetails}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </ScrollView>
                    <LinearGradient colors={["transparent", colors.background, colors.background]} style={[styles.footerAbs, { paddingBottom: 24 + insets.bottom }]}>
                        <TouchableOpacity style={styles.confirmButton} activeOpacity={0.9} onPress={handleContinueStep2}>
                            <Text style={styles.confirmButtonText}>Continuer</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>

                {/* Step 3: Final Password */}
                <View style={{ width, flex: 1 }}>
                    <View style={styles.mainContentFinal}>
                        <View style={styles.iconContainer}>
                            <View style={styles.iconGlowFinal} />
                            <View style={[styles.iconCircleFinal, { backgroundColor: colors.surface }]}>
                                <MaterialIcons name={isBypassActive ? "no-accounts" : "lock-open"} size={40} color="#ef4444" />
                            </View>
                        </View>
                        <Text style={[styles.title, { color: colors.text }]}>Confirmer la désactivation</Text>
                        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                            {isBypassActive 
                                ? `Puisque tu utilises la connexion sociale, aucune vérification supplémentaire n'est requise. Tu pourras réactiver ton compte en te reconnectant sous ${graceDaysLabel}.`
                                : `Saisis ton mot de passe pour confirmer. Tu pourras réactiver le compte en te reconnectant sous ${graceDaysLabel}.`}
                        </Text>
                        {!isBypassActive && (
                            <>
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
                                    <TouchableOpacity style={styles.inputIconRight} onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                                        <MaterialIcons name={showPassword ? "visibility-off" : "visibility"} size={20} color={colors.textMuted} />
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity style={styles.forgotPassword} activeOpacity={0.7}>
                                    <Text style={[styles.forgotPasswordText, { color: colors.textMuted }]}>Mot de passe oublié ?</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                    <View style={[styles.footer, { paddingBottom: 24 + insets.bottom }]}>
                        <TouchableOpacity style={[styles.deleteButton, isDeleting && { opacity: 0.7 }]} activeOpacity={0.9} onPress={handleDelete} disabled={isDeleting}>
                            {isDeleting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <MaterialIcons name={isBypassActive ? "check-circle" : "delete-forever"} size={22} color="#fff" />
                                    <Text style={styles.deleteButtonText}>{isBypassActive ? "CONFIRMER LA DÉSACTIVATION" : "DÉSACTIVER MON COMPTE"}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} activeOpacity={0.7} onPress={handleBack}>
                            <Text style={[styles.cancelButtonText, { color: colors.textMuted }]}>Annuler</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 16, gap: 16 },
    headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    backButton: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
    stepIndicator: { fontSize: 14, fontWeight: "500" },
    progressBarContainer: { flexDirection: "row", gap: 8, paddingHorizontal: 8 },
    progressBarSegment: { flex: 1, height: 4, borderRadius: 2 },
    mainContent: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, marginTop: 10 },
    iconContainer: { marginBottom: 32, position: "relative", alignItems: "center", justifyContent: "center" },
    iconGlowWarning: { position: "absolute", width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(239,68,68,0.2)" },
    iconCircle: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", borderWidth: 1 },
    title: { fontSize: 30, fontWeight: "700", textAlign: "center", marginBottom: 12, letterSpacing: -0.5 },
    subtitle: { fontSize: 14, textAlign: "center", lineHeight: 22, marginBottom: 40, paddingHorizontal: 16 },
    cardsList: { width: "100%", gap: 16 },
    lossCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, borderWidth: 1 },
    lossIconCircle: { width: 40, height: 40, borderRadius: 20, marginRight: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(239,68,68,0.1)" },
    lossTextContainer: { flex: 1 },
    lossTitle: { fontSize: 15, fontWeight: "500", marginBottom: 2 },
    lossSubtitle: { fontSize: 12 },
    footer: { paddingHorizontal: 24, gap: 16 },
    primaryButton: { paddingVertical: 16, borderRadius: 16, alignItems: "center", backgroundColor: COLORS.primary, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
    primaryButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
    secondaryButton: { alignItems: "center", paddingVertical: 12 },
    secondaryButtonText: { color: "rgba(248,113,113,0.8)", fontSize: 14, fontWeight: "500" },

    scrollContent: { paddingHorizontal: 24, paddingTop: 24 },
    reasonsList: { gap: 14 },
    reasonCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderRadius: 20, borderWidth: 1 },
    reasonText: { fontSize: 14, fontWeight: "500", flex: 1 },
    radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#fff" },
    detailsSection: { marginTop: 24 },
    detailsLabel: { fontSize: 12, fontWeight: "500", marginBottom: 8, marginLeft: 4 },
    detailsInput: { borderRadius: 20, borderWidth: 1, padding: 16, fontSize: 14, minHeight: 120 },
    footerAbs: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 24 },
    confirmButton: { paddingVertical: 18, borderRadius: 20, borderWidth: 2, borderColor: "rgba(239,68,68,0.5)", alignItems: "center", justifyContent: "center" },
    confirmButtonText: { color: "#ef4444", fontSize: 16, fontWeight: "700" },

    mainContentFinal: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, marginTop: 10 },
    iconGlowFinal: { position: "absolute", width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(239,68,68,0.15)" },
    iconCircleFinal: { width: 96, height: 96, borderRadius: 48, borderWidth: 1, borderColor: "rgba(239,68,68,0.2)", alignItems: "center", justifyContent: "center", shadowColor: "#ef4444", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
    inputContainer: { width: "100%", flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 16, paddingHorizontal: 16 },
    inputIconLeft: { marginRight: 12 },
    input: { flex: 1, paddingVertical: 16, fontSize: 16 },
    inputIconRight: { marginLeft: 12, padding: 4 },
    forgotPassword: { width: "100%", alignItems: "flex-end", marginTop: 12 },
    forgotPasswordText: { fontSize: 12 },
    deleteButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#dc2626", paddingVertical: 18, borderRadius: 16, shadowColor: "#dc2626", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
    deleteButtonText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },
    cancelButton: { alignItems: "center", paddingVertical: 12 },
    cancelButtonText: { fontSize: 14, fontWeight: "500" },
});

export default DeleteAccountScreen;
