import { Dimensions, StyleSheet } from "react-native";
import { ThemeColors } from "../../constants/colors";

export const SURFACE_DARK = "#1c1c21";
export const BG_DARK = "#0b0b0f";
export const SUCCESS = "#34d399";

export const { width, height } = Dimensions.get("window");

export const getOnboardingStyles = (colors: ThemeColors) => StyleSheet.create({
    formGroup: {
        gap: 8,
        marginTop: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.text,
        marginLeft: 4,
    },
    inputWrapper: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    input: {
        flex: 1,
        height: 56,
        fontSize: 16,
        color: colors.text,
    },
    inputWithLeftIcon: {
        paddingLeft: 8,
    },
    inputIcon: {
        marginLeft: 8,
    },
    inputIconLeft: {
        marginRight: 4,
    },
    visibilityBtn: {
        padding: 8,
    },
    hint: {
        fontSize: 12,
        color: colors.textMuted,
        marginLeft: 4,
        marginTop: 4,
    },
    phoneRow: {
        flexDirection: "row",
        gap: 12,
    },
    countryCode: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 12,
        height: 56,
    },
    countryFlag: {
        fontSize: 20,
    },
    countryCodeText: {
        fontSize: 14,
        fontWeight: "500",
        color: colors.text,
    },
    phoneInput: {
        flex: 1,
    },
    iconBadge: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: colors.accent20,
        borderWidth: 1,
        borderColor: colors.accent + '33',
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    usernameInputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: colors.accent20,
        paddingHorizontal: 16,
        height: 64,
        marginTop: 16,
    },
    atSymbol: {
        fontSize: 24,
        fontWeight: "600",
        color: colors.accent,
        marginRight: 4,
    },
    usernameInput: {
        flex: 1,
        fontSize: 22,
        fontWeight: "500",
        color: colors.text,
    },
    availableText: {
        fontSize: 14,
        color: SUCCESS,
        fontWeight: "500",
        marginTop: 8,
        marginLeft: 4,
    },
    suggestionsSection: {
        marginTop: 32,
    },
    suggestionsLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.textMuted,
        letterSpacing: 2,
        marginBottom: 12,
        marginLeft: 4,
    },
    suggestionsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    suggestionChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    suggestionText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    optionsList: {
        gap: 12,
    },
    sportOption: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.surface,
        borderRadius: 28,
        paddingVertical: 4,
        paddingHorizontal: 4,
        paddingRight: 24,
        borderWidth: 1,
        borderColor: "transparent",
    },
    sportOptionSelected: {
        backgroundColor: colors.accent,
    },
    sportLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    sportIconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.surfaceAlt,
        alignItems: "center",
        justifyContent: "center",
    },
    sportIconSelected: {
        backgroundColor: "rgba(255,255,255,0.2)",
    },
    sportLabel: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.textSecondary,
    },
    sportLabelSelected: {
        color: "#fff",
        fontWeight: "700",
    },
    checkCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    moodGrid: {
        gap: 16,
    },
    moodCard: {
        height: 160,
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    moodCardSelected: {
        borderColor: colors.accent,
        backgroundColor: colors.accent10,
    },
    moodLabel: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text,
    },
    moodLabelSelected: {
        color: colors.accent,
    },
    moodSubtitle: {
        fontSize: 14,
        color: colors.textMuted,
    },
    venueOption: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 20,
        backgroundColor: colors.backgroundLight,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    venueOptionSelected: {
        backgroundColor: colors.surface,
        borderColor: colors.accent,
    },
    venueLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 16,
    },
    venueIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: colors.surfaceAlt,
        alignItems: "center",
        justifyContent: "center",
    },
    venueIconSelected: {
        backgroundColor: colors.accent,
    },
    venueTexts: {
        flex: 1,
    },
    venueLabel: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.text,
        marginBottom: 4,
    },
    venueLabelSelected: {
        color: colors.text,
    },
    venueSubtitle: {
        fontSize: 14,
        color: colors.textMuted,
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
    },
    radioCircleSelected: {
        borderColor: colors.accent,
        backgroundColor: colors.accent,
    },
    budgetList: {
        gap: 16,
        paddingTop: 20,
    },
    budgetOption: {
        height: 72,
        backgroundColor: colors.surface,
        borderRadius: 36,
        borderWidth: 2,
        borderColor: "transparent",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    budgetOptionSelected: {
        borderColor: colors.accent,
    },
    budgetCenter: {
        alignItems: "center",
    },
    budgetAmount: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.text,
    },
    budgetTier: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 2,
        color: colors.textMuted,
        marginTop: 2,
    },
    budgetCheck: {
        position: "absolute",
        right: 24,
    },
});
