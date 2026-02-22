import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useStore } from "../store/useStore";
import {
    BUDGET_OPTIONS,
    MOOD_OPTIONS,
    SPORTS_OPTIONS,
    VENUE_OPTIONS,
} from "../screens/onboarding/options";

const normalizeList = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const toggleValue = (list: string[], value: string) =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

const OAuthProfileCompletionModal = () => {
    const { isAuthenticated, user, colors, isLoading, completeOAuthProfile } = useStore();
    const userData = user?.user ?? user ?? null;
    const preferences = userData?.preferences;
    const authProvider = userData?.auth_provider;
    const isOAuthUser = authProvider === "google" || authProvider === "apple";

    const currentPhone = userData?.phone?.trim() || "";
    const currentSports = normalizeList(preferences?.sports);
    const currentAmbiance = normalizeList(preferences?.ambiance);
    const currentFoodTypes = normalizeList(preferences?.foodTypes);
    const currentBudget = preferences?.budget?.trim() || "";

    const hasCompletePhone = currentPhone.length > 0;
    const hasCompletePreferences =
        currentSports.length > 0 &&
        currentAmbiance.length > 0 &&
        currentFoodTypes.length > 0 &&
        currentBudget.length > 0;

    const shouldShow = Boolean(
        isAuthenticated &&
            isOAuthUser &&
            (!hasCompletePhone || !hasCompletePreferences)
    );

    const [phone, setPhone] = useState(currentPhone);
    const [sports, setSports] = useState<string[]>(currentSports);
    const [ambiances, setAmbiances] = useState<string[]>(currentAmbiance);
    const [venueTypes, setVenueTypes] = useState<string[]>(currentFoodTypes);
    const [budget, setBudget] = useState(currentBudget);

    useEffect(() => {
        if (!shouldShow) return;
        setPhone(currentPhone);
        setSports(currentSports);
        setAmbiances(currentAmbiance);
        setVenueTypes(currentFoodTypes);
        setBudget(currentBudget);
    }, [
        shouldShow,
        currentPhone,
        currentBudget,
        JSON.stringify(currentSports),
        JSON.stringify(currentAmbiance),
        JSON.stringify(currentFoodTypes),
    ]);

    const canSubmit = useMemo(() => {
        const phoneDigits = phone.replace(/\D/g, "");
        return (
            phoneDigits.length >= 8 &&
            sports.length > 0 &&
            ambiances.length > 0 &&
            venueTypes.length > 0 &&
            budget.length > 0
        );
    }, [ambiances.length, budget.length, phone, sports.length, venueTypes.length]);

    const handleSubmit = async () => {
        if (!canSubmit || isLoading) return;

        const success = await completeOAuthProfile({
            phone: phone.trim(),
            fav_sports: sports,
            ambiances,
            venue_types: venueTypes,
            budget,
        });

        if (!success) {
            const error = useStore.getState().error;
            Alert.alert("Profil incomplet", error || "Impossible de sauvegarder les informations.");
        }
    };

    if (!shouldShow) return null;

    return (
        <Modal visible transparent animationType="fade" statusBarTranslucent>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.overlay}
            >
                <View style={[styles.sheet, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
                    <Text style={[styles.title, { color: colors.text }]}>Dernière étape</Text>
                    <Text style={[styles.subtitle, { color: colors.subtext }]}>
                        Complète ton profil pour continuer: téléphone + préférences.
                    </Text>

                    <ScrollView
                        style={styles.formScroll}
                        contentContainerStyle={styles.formContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Téléphone</Text>
                            <TextInput
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                placeholder="+33 6 12 34 56 78"
                                placeholderTextColor={colors.textMuted}
                                style={[
                                    styles.phoneInput,
                                    {
                                        color: colors.text,
                                        borderColor: colors.border,
                                        backgroundColor: colors.surface,
                                    },
                                ]}
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sports favoris</Text>
                            <View style={styles.chipWrap}>
                                {SPORTS_OPTIONS.map((option) => {
                                    const selected = sports.includes(option.id);
                                    return (
                                        <TouchableOpacity
                                            key={option.id}
                                            style={[
                                                styles.chip,
                                                {
                                                    borderColor: selected ? colors.primary : colors.border,
                                                    backgroundColor: selected ? "rgba(244,123,37,0.15)" : colors.surface,
                                                },
                                            ]}
                                            onPress={() => setSports((prev) => toggleValue(prev, option.id))}
                                        >
                                            <MaterialIcons
                                                name={option.icon}
                                                size={16}
                                                color={selected ? colors.primary : colors.textSecondary}
                                            />
                                            <Text style={[styles.chipText, { color: selected ? colors.primary : colors.text }]}>
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ambiance</Text>
                            <View style={styles.chipWrap}>
                                {MOOD_OPTIONS.map((option) => {
                                    const selected = ambiances.includes(option.id);
                                    return (
                                        <TouchableOpacity
                                            key={option.id}
                                            style={[
                                                styles.chip,
                                                {
                                                    borderColor: selected ? colors.primary : colors.border,
                                                    backgroundColor: selected ? "rgba(244,123,37,0.15)" : colors.surface,
                                                },
                                            ]}
                                            onPress={() => setAmbiances((prev) => toggleValue(prev, option.id))}
                                        >
                                            <MaterialIcons
                                                name={option.icon}
                                                size={16}
                                                color={selected ? colors.primary : colors.textSecondary}
                                            />
                                            <Text style={[styles.chipText, { color: selected ? colors.primary : colors.text }]}>
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Type de lieu</Text>
                            <View style={styles.chipWrap}>
                                {VENUE_OPTIONS.map((option) => {
                                    const selected = venueTypes.includes(option.id);
                                    return (
                                        <TouchableOpacity
                                            key={option.id}
                                            style={[
                                                styles.chip,
                                                {
                                                    borderColor: selected ? colors.primary : colors.border,
                                                    backgroundColor: selected ? "rgba(244,123,37,0.15)" : colors.surface,
                                                },
                                            ]}
                                            onPress={() => setVenueTypes((prev) => toggleValue(prev, option.id))}
                                        >
                                            <MaterialIcons
                                                name={option.icon}
                                                size={16}
                                                color={selected ? colors.primary : colors.textSecondary}
                                            />
                                            <Text style={[styles.chipText, { color: selected ? colors.primary : colors.text }]}>
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Budget</Text>
                            <View style={styles.budgetRow}>
                                {BUDGET_OPTIONS.map((option) => {
                                    const selected = budget === option.id;
                                    return (
                                        <TouchableOpacity
                                            key={option.id}
                                            style={[
                                                styles.budgetOption,
                                                {
                                                    borderColor: selected ? colors.primary : colors.border,
                                                    backgroundColor: selected ? "rgba(244,123,37,0.15)" : colors.surface,
                                                },
                                            ]}
                                            onPress={() => setBudget(option.id)}
                                        >
                                            <Text style={[styles.budgetLabel, { color: selected ? colors.primary : colors.text }]}>
                                                {option.subtitle}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </ScrollView>

                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            {
                                backgroundColor: canSubmit ? colors.primary : colors.surfaceAlt,
                                opacity: isLoading ? 0.7 : 1,
                            },
                        ]}
                        disabled={!canSubmit || isLoading}
                        onPress={handleSubmit}
                    >
                        <Text style={[styles.submitText, { color: canSubmit ? colors.white : colors.textMuted }]}>
                            {isLoading ? "Enregistrement..." : "Valider"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        paddingHorizontal: 16,
    },
    sheet: {
        borderRadius: 20,
        borderWidth: 1,
        maxHeight: "90%",
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
    },
    subtitle: {
        marginTop: 6,
        fontSize: 14,
        lineHeight: 20,
    },
    formScroll: {
        marginTop: 14,
    },
    formContent: {
        gap: 14,
        paddingBottom: 8,
    },
    section: {
        gap: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
    },
    phoneInput: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === "ios" ? 12 : 10,
        fontSize: 16,
    },
    chipWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    chip: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    chipText: {
        fontSize: 13,
        fontWeight: "600",
    },
    budgetRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    budgetOption: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    budgetLabel: {
        fontSize: 12,
        fontWeight: "700",
    },
    submitButton: {
        marginTop: 12,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
    },
    submitText: {
        fontSize: 16,
        fontWeight: "800",
    },
});

export default OAuthProfileCompletionModal;
