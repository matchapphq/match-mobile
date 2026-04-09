import React, { ReactNode } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { BG_DARK, BRAND_PRIMARY, SURFACE_DARK, width, height } from "./styles";
import { ONBOARDING_TOTAL_STEPS } from "../../store/useOnboardingForm";
import { useStore } from "../../store/useStore";

export type OnboardingLayoutProps = {
    step: number;
    title: ReactNode;
    subtitle?: ReactNode;
    nextLabel?: string;
    canContinue?: boolean;
    footerNote?: ReactNode;
    error?: string | null;
    onNext: () => void;
    onBack: () => void;
    children: ReactNode;
};

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
    step,
    title,
    subtitle,
    nextLabel = "Continuer",
    canContinue = true,
    footerNote,
    error,
    onNext,
    onBack,
    children,
}) => {
    const { colors } = useStore();
    const progressWidth = `${(step / ONBOARDING_TOTAL_STEPS) * 100}%`;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.glowTop, { backgroundColor: colors.accent15 }]} />
            <View style={[styles.glowBottom, { backgroundColor: colors.accent10 }]} />

            <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
                <View style={styles.header}>
                    <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surfaceGlass, borderColor: colors.border }]} onPress={onBack}>
                        <MaterialIcons name="arrow-back-ios-new" size={18} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.stepIndicator, { color: colors.textMuted }]}>Étape {step} sur {ONBOARDING_TOTAL_STEPS}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={[styles.progressBar, { backgroundColor: colors.surfaceAlt }]}>
                    <View style={[styles.progressFill, { width: progressWidth as any, backgroundColor: colors.accent, shadowColor: colors.accent }]} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentHeader}>
                        {typeof title === "string" ? (
                            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                        ) : (
                            <View>{title}</View>
                        )}
                        {subtitle ? (
                            typeof subtitle === "string" ? (
                                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
                            ) : (
                                <View>{subtitle}</View>
                            )
                        ) : null}
                        {error ? (
                            <View style={styles.errorBanner}>
                                <MaterialIcons name="error-outline" size={20} color="#ff6b6b" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}
                    </View>
                    {children}
                </ScrollView>

                <View style={[styles.footer, { backgroundColor: colors.background }]}>
                    <TouchableOpacity
                        style={[styles.ctaButton, { backgroundColor: colors.primary, shadowColor: colors.primary }, !canContinue && styles.ctaButtonDisabled]}
                        onPress={onNext}
                        disabled={!canContinue}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.ctaText}>{nextLabel}</Text>
                        <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                    {footerNote ? (
                        typeof footerNote === "string" ? (
                            <Text style={[styles.footerNote, { color: colors.textMuted }]}>{footerNote}</Text>
                        ) : (
                            <View>{footerNote}</View>
                        )
                    ) : null}
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    glowTop: {
        position: "absolute",
        top: -height * 0.1,
        right: -width * 0.1,
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        opacity: 0.6,
    },
    glowBottom: {
        position: "absolute",
        bottom: height * 0.1,
        left: -width * 0.1,
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: width * 0.3,
        opacity: 0.5,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    stepIndicator: {
        fontSize: 12,
        fontWeight: "500",
        letterSpacing: 1,
        textTransform: "uppercase",
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
        marginHorizontal: 20,
        marginBottom: 24,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 3,
        shadowOpacity: 0.6,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    contentHeader: {
        gap: 12,
        marginBottom: 12,
    },
    errorBanner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 107, 107, 0.1)",
        padding: 12,
        borderRadius: 12,
        gap: 8,
        marginTop: 8,
        borderWidth: 1,
        borderColor: "rgba(255, 107, 107, 0.2)",
    },
    errorText: {
        color: "#ff6b6b",
        fontSize: 14,
        fontWeight: "500",
        flex: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: "300",
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 16,
        paddingTop: 12,
    },
    ctaButton: {
        height: 56,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        shadowOpacity: 0.3,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
    },
    ctaButtonDisabled: {
        opacity: 0.4,
    },
    ctaText: {
        fontSize: 17,
        fontWeight: "700",
        color: "#fff",
    },
    footerNote: {
        fontSize: 12,
        textAlign: "center",
        marginTop: 16,
        lineHeight: 18,
    },
});

export default OnboardingLayout;
