import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useStore } from "../store/useStore";

const REASONS = [
    "Je reçois trop de notifications",
    "Je n'utilise plus l'application",
    "Il manque des fonctionnalités",
    "Problèmes techniques / Bugs",
    "Autre raison",
];

const DeleteAccountConfirmScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { colors, themeMode } = useStore();

    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [details, setDetails] = useState("");

    const handleBack = () => {
        navigation.goBack();
    };

    const handleContinue = () => {
        if (!selectedReason) {
            Alert.alert("Raison requise", "Merci de sélectionner une raison.");
            return;
        }

        navigation.navigate("DeleteAccountFinal", {
            reason: selectedReason,
            details: details.trim() || undefined,
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={themeMode === "light" ? "dark-content" : "light-content"} />

            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: "rgba(255,255,255,0.08)" }]}
                        onPress={handleBack}
                        activeOpacity={0.85}
                    >
                        <MaterialIcons name="arrow-back" size={22} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.stepIndicator, { color: colors.textMuted }]}>Étape 2 sur 3</Text>
                    <View style={{ width: 44 }} />
                </View>
                <View style={styles.progressBarTrack}>
                    <View style={[styles.progressBarFill, { width: "66%" }]} />
                </View>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[styles.title, { color: colors.text }]}>Pourquoi nous quittez-vous ?</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                    Votre avis est précieux pour nous aider à nous améliorer.
                </Text>

                <View style={styles.reasonsList}>
                    {REASONS.map((reason) => {
                        const isSelected = selectedReason === reason;
                        return (
                            <TouchableOpacity
                                key={reason}
                                style={[
                                    styles.reasonCard,
                                    { backgroundColor: colors.surface, borderColor: isSelected ? colors.primary : colors.border },
                                    isSelected && { backgroundColor: "rgba(244,123,37,0.1)" },
                                ]}
                                activeOpacity={0.85}
                                onPress={() => setSelectedReason(reason)}
                            >
                                <Text style={[styles.reasonText, { color: colors.text }]}>{reason}</Text>
                                <View
                                    style={[
                                        styles.radioCircle,
                                        { borderColor: isSelected ? colors.primary : "rgba(255,255,255,0.2)" },
                                        isSelected && { backgroundColor: colors.primary },
                                    ]}
                                >
                                    {isSelected && <View style={styles.radioInner} />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.detailsSection}>
                    <Text style={[styles.detailsLabel, { color: colors.textMuted }]}>
                        Détails supplémentaires (optionnel)
                    </Text>
                    <TextInput
                        style={[
                            styles.detailsInput,
                            { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
                        ]}
                        placeholder="Dites-nous en plus..."
                        placeholderTextColor="rgba(255,255,255,0.25)"
                        value={details}
                        onChangeText={setDetails}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>
            </ScrollView>

            <LinearGradient
                colors={["transparent", colors.background, colors.background]}
                style={[styles.footer, { paddingBottom: 24 + insets.bottom }]}
            >
                <TouchableOpacity
                    style={styles.confirmButton}
                    activeOpacity={0.9}
                    onPress={handleContinue}
                >
                    <Text style={styles.confirmButtonText}>Continuer</Text>
                </TouchableOpacity>
            </LinearGradient>
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
    progressBarTrack: {
        height: 4,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 2,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: "#f47b25",
        borderRadius: 2,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        textAlign: "center",
        marginBottom: 28,
        lineHeight: 20,
    },
    reasonsList: {
        gap: 14,
    },
    reasonCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    reasonText: {
        fontSize: 14,
        fontWeight: "500",
        flex: 1,
    },
    radioCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#fff",
    },
    detailsSection: {
        marginTop: 24,
    },
    detailsLabel: {
        fontSize: 12,
        fontWeight: "500",
        marginBottom: 8,
        marginLeft: 4,
    },
    detailsInput: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 16,
        fontSize: 14,
        minHeight: 120,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    confirmButton: {
        paddingVertical: 18,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "rgba(239,68,68,0.5)",
        alignItems: "center",
        justifyContent: "center",
    },
    confirmButtonText: {
        color: "#ef4444",
        fontSize: 16,
        fontWeight: "700",
    },
});

export default DeleteAccountConfirmScreen;
