import React, { ReactNode } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { width, height } from "./styles";
import { ONBOARDING_TOTAL_STEPS } from "../../store/useOnboardingForm";
import { useStore } from "../../store/useStore";

export type OnboardingLayoutProps = {
    currentStepIndex: number;
    scrollX: Animated.SharedValue<number>;
    nextLabel?: string;
    canContinue?: boolean;
    footerNote?: ReactNode;
    onNext: () => void;
    onBack: () => void;
    children: ReactNode;
};

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
    currentStepIndex,
    scrollX,
    nextLabel = "Continuer",
    canContinue = true,
    footerNote,
    onNext,
    onBack,
    children,
}) => {
    const { colors } = useStore();

    const animatedProgressStyle = useAnimatedStyle(() => {
        const step = (scrollX.value / width) + 1;
        const progress = (step / ONBOARDING_TOTAL_STEPS) * 100;
        return {
            width: `${Math.max(0, Math.min(100, progress))}%`,
        };
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.glowTop, { backgroundColor: colors.accent15 }]} />
            <View style={[styles.glowBottom, { backgroundColor: colors.accent10 }]} />

            <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
                <View style={styles.header}>
                    <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surfaceGlass, borderColor: colors.border }]} onPress={onBack}>
                        <MaterialIcons name="arrow-back-ios-new" size={18} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.stepIndicator, { color: colors.textMuted }]}>Étape {currentStepIndex + 1} sur {ONBOARDING_TOTAL_STEPS}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={[styles.progressBar, { backgroundColor: colors.surfaceAlt }]}>
                    <Animated.View style={[styles.progressFill, { backgroundColor: colors.accent, shadowColor: colors.accent }, animatedProgressStyle]} />
                </View>

                <View style={styles.contentContainer}>
                    {children}
                </View>

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
    contentContainer: {
        flex: 1,
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
