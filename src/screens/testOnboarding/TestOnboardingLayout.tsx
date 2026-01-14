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
import { TEST_ONBOARDING_TOTAL_STEPS } from "../../store/useTestOnboardingForm";

export type TestOnboardingLayoutProps = {
    step: number;
    title: ReactNode;
    subtitle?: ReactNode;
    nextLabel?: string;
    canContinue?: boolean;
    footerNote?: ReactNode;
    onNext: () => void;
    onBack: () => void;
    children: ReactNode;
};

export const TestOnboardingLayout: React.FC<TestOnboardingLayoutProps> = ({
    step,
    title,
    subtitle,
    nextLabel = "Continuer",
    canContinue = true,
    footerNote,
    onNext,
    onBack,
    children,
}) => {
    const progressWidth = `${(step / TEST_ONBOARDING_TOTAL_STEPS) * 100}%`;

    return (
        <View style={styles.container}>
            <LinearGradient colors={[BG_DARK, BG_DARK]} style={StyleSheet.absoluteFillObject} />
            <View style={styles.glowTop} />
            <View style={styles.glowBottom} />

            <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <MaterialIcons name="arrow-back-ios-new" size={18} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>
                    <Text style={styles.stepIndicator}>Étape {step} sur {TEST_ONBOARDING_TOTAL_STEPS}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: progressWidth as any }]} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentHeader}>
                        <Text style={styles.title}>{title}</Text>
                        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                    </View>
                    {children}
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.ctaButton, !canContinue && styles.ctaButtonDisabled]}
                        onPress={onNext}
                        disabled={!canContinue}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.ctaText}>{nextLabel}</Text>
                        <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                    {footerNote ? <Text style={styles.footerNote}>{footerNote}</Text> : null}
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG_DARK,
    },
    glowTop: {
        position: "absolute",
        top: -height * 0.1,
        right: -width * 0.1,
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: `${BRAND_PRIMARY}15`,
        opacity: 0.6,
    },
    glowBottom: {
        position: "absolute",
        bottom: height * 0.1,
        left: -width * 0.1,
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: width * 0.3,
        backgroundColor: `${BRAND_PRIMARY}08`,
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
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
        alignItems: "center",
        justifyContent: "center",
    },
    stepIndicator: {
        fontSize: 12,
        fontWeight: "500",
        letterSpacing: 1,
        color: "rgba(255,255,255,0.4)",
        textTransform: "uppercase",
    },
    progressBar: {
        height: 6,
        backgroundColor: SURFACE_DARK,
        borderRadius: 3,
        marginHorizontal: 20,
        marginBottom: 24,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: BRAND_PRIMARY,
        borderRadius: 3,
        shadowColor: BRAND_PRIMARY,
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
    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#fff",
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: "rgba(255,255,255,0.6)",
        lineHeight: 24,
        fontWeight: "300",
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 16,
        paddingTop: 12,
        backgroundColor: BG_DARK,
    },
    ctaButton: {
        height: 56,
        borderRadius: 16,
        backgroundColor: BRAND_PRIMARY,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        shadowColor: BRAND_PRIMARY,
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
        color: "rgba(255,255,255,0.3)",
        textAlign: "center",
        marginTop: 16,
        lineHeight: 18,
    },
});

export default TestOnboardingLayout;
