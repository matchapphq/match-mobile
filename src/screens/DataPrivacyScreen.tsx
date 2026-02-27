import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useStore } from "../store/useStore";
import { apiService } from "../services/api";
import { usePostHog } from "posthog-react-native";

const DEFAULT_EXPORT_MESSAGE =
    "Bonjour,\nJe souhaite recevoir un export de mes données personnelles liées à mon compte Match.\nMerci.";

const formatGraceDaysLabel = (days: number | null) =>
    days === null ? "le délai de réactivation" : `${days} jour${days > 1 ? "s" : ""}`;

const DataPrivacyScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { colors, computedTheme: themeMode } = useStore();
    const posthog = usePostHog();

    const [exportModalVisible, setExportModalVisible] = useState(false);
    const [exportMessage, setExportMessage] = useState(DEFAULT_EXPORT_MESSAGE);
    const [isSubmittingExport, setIsSubmittingExport] = useState(false);
    const [accountDeletionGraceDays, setAccountDeletionGraceDays] = useState<number | null>(null);
    const accountDeletionGraceLabel = formatGraceDaysLabel(accountDeletionGraceDays);

    React.useEffect(() => {
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

        return () => {
            isMounted = false;
        };
    }, []);

    const handleBack = () => navigation.goBack();

    const handleOpenExportModal = () => {
        setExportMessage(DEFAULT_EXPORT_MESSAGE);
        setExportModalVisible(true);
    };

    const handleCloseExportModal = () => {
        if (isSubmittingExport) return;
        setExportModalVisible(false);
    };

    const handleSubmitExportRequest = async () => {
        const message = exportMessage.trim();
        if (!message) {
            Alert.alert("Message requis", "Ajoutez un message pour préciser votre demande.");
            return;
        }

        setIsSubmittingExport(true);
        try {
            const result = await apiService.requestDataExport({ message });
            if (!result?.success) {
                throw new Error(
                    result?.message || "Impossible d'envoyer la demande pour le moment."
                );
            }
            posthog?.capture("data_export_request_success");
            setExportModalVisible(false);
            Alert.alert(
                "Demande envoyée",
                "Votre demande d'export a été transmise à data@matchapp.fr."
            );
        } catch (error: any) {
            console.error("Data export request error:", error);
            const rawMessage =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.message ||
                "Impossible d'envoyer la demande pour le moment.";
            const normalized = String(rawMessage).toLowerCase();
            const errorMessage = normalized.includes("timeout")
                ? "La demande prend trop de temps. Réessayez dans quelques secondes."
                : String(rawMessage);

            posthog?.capture("data_export_request_failed", { error: errorMessage });
            Alert.alert("Erreur", errorMessage);
        } finally {
            setIsSubmittingExport(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={themeMode === "light" ? "dark-content" : "light-content"} />

            <View
                style={[
                    styles.header,
                    { paddingTop: insets.top + 10, borderBottomColor: colors.border },
                ]}
            >
                <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.8}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Données personnelles</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: 28 + insets.bottom }]}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                    Gérez votre export RGPD et la désactivation de votre compte.
                </Text>

                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconBox, { backgroundColor: "rgba(59,130,246,0.12)" }]}>
                            <MaterialIcons name="download" size={20} color="#60a5fa" />
                        </View>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>Demander un export</Text>
                    </View>
                    <Text style={[styles.cardDescription, { color: colors.textMuted }]}>
                        Votre demande sera transmise à data@matchapp.fr.
                    </Text>
                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                        activeOpacity={0.9}
                        onPress={handleOpenExportModal}
                    >
                        <Text style={styles.primaryButtonText}>Demander un export</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconBox, { backgroundColor: "rgba(239,68,68,0.12)" }]}>
                            <MaterialIcons name="delete-outline" size={20} color="#f87171" />
                        </View>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>Désactiver le compte</Text>
                    </View>
                    <Text style={[styles.cardDescription, { color: colors.textMuted }]}>
                        {`Le compte est désactivé immédiatement. Les données sont conservées pendant ${accountDeletionGraceLabel} avant suppression définitive. Vous pouvez réactiver en vous reconnectant durant ce délai.`}
                    </Text>
                    <TouchableOpacity
                        style={styles.dangerButton}
                        activeOpacity={0.9}
                        onPress={() =>
                            navigation.navigate("DeleteAccountWarning", {
                                accountDeletionGraceDays: accountDeletionGraceDays ?? undefined,
                            })
                        }
                    >
                        <Text style={styles.dangerButtonText}>Désactiver mon compte</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal
                visible={exportModalVisible}
                transparent
                animationType="slide"
                onRequestClose={handleCloseExportModal}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.modalContainer}
                    >
                        <View
                            style={[
                                styles.modalContent,
                                { backgroundColor: colors.background, borderColor: colors.border },
                            ]}
                        >
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>
                                    Demande d'export RGPD
                                </Text>
                                <TouchableOpacity onPress={handleCloseExportModal} disabled={isSubmittingExport}>
                                    <MaterialIcons name="close" size={24} color={colors.text} />
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.modalHint, { color: colors.textMuted }]}>
                                Un email sera envoyé à data@matchapp.fr.
                            </Text>

                            <TextInput
                                style={[
                                    styles.modalInput,
                                    {
                                        backgroundColor: colors.surface,
                                        borderColor: colors.border,
                                        color: colors.text,
                                    },
                                ]}
                                value={exportMessage}
                                onChangeText={setExportMessage}
                                placeholder="Ajoutez votre message"
                                placeholderTextColor={colors.textMuted}
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                                maxLength={2000}
                            />

                            <TouchableOpacity
                                style={[
                                    styles.modalSubmitButton,
                                    { backgroundColor: colors.primary },
                                    isSubmittingExport && { opacity: 0.7 },
                                ]}
                                onPress={handleSubmitExportRequest}
                                disabled={isSubmittingExport}
                            >
                                {isSubmittingExport ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Text style={styles.modalSubmitText}>Envoyer</Text>
                                        <MaterialIcons name="send" size={18} color="#fff" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
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
    content: {
        padding: 20,
        gap: 14,
    },
    subtitle: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 2,
    },
    card: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        gap: 10,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    iconBox: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: "700",
    },
    cardDescription: {
        fontSize: 13,
        lineHeight: 19,
    },
    primaryButton: {
        marginTop: 4,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
    },
    primaryButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 14,
    },
    dangerButton: {
        marginTop: 4,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
        backgroundColor: "#ef4444",
    },
    dangerButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        width: "100%",
    },
    modalContent: {
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderBottomWidth: 0,
        gap: 12,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: "700",
    },
    modalHint: {
        fontSize: 13,
    },
    modalInput: {
        borderWidth: 1,
        borderRadius: 12,
        minHeight: 140,
        padding: 12,
        fontSize: 14,
    },
    modalSubmitButton: {
        marginTop: 4,
        borderRadius: 12,
        minHeight: 46,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 6,
    },
    modalSubmitText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 14,
    },
});

export default DataPrivacyScreen;
