import { Dimensions, StyleSheet } from "react-native";

export const BRAND_PRIMARY = "#f47b25";
export const SURFACE_DARK = "#1c1c21";
export const BG_DARK = "#0b0b0f";
export const SUCCESS = "#34d399";

export const { width, height } = Dimensions.get("window");

export const sharedStyles = StyleSheet.create({
    formGroup: {
        gap: 8,
        marginTop: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
        marginLeft: 4,
    },
    inputWrapper: {
        backgroundColor: SURFACE_DARK,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    input: {
        flex: 1,
        height: 56,
        fontSize: 16,
        color: "#fff",
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
        color: "rgba(255,255,255,0.3)",
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
        backgroundColor: SURFACE_DARK,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        paddingHorizontal: 12,
        height: 56,
    },
    countryFlag: {
        fontSize: 20,
    },
    countryCodeText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#fff",
    },
    phoneInput: {
        flex: 1,
    },
    iconBadge: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: `${BRAND_PRIMARY}20`,
        borderWidth: 1,
        borderColor: `${BRAND_PRIMARY}30`,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    usernameInputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: SURFACE_DARK,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: `${BRAND_PRIMARY}50`,
        paddingHorizontal: 16,
        height: 64,
        marginTop: 16,
    },
    atSymbol: {
        fontSize: 24,
        fontWeight: "600",
        color: BRAND_PRIMARY,
        marginRight: 4,
    },
    usernameInput: {
        flex: 1,
        fontSize: 22,
        fontWeight: "500",
        color: "#fff",
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
        color: "rgba(255,255,255,0.4)",
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
        backgroundColor: SURFACE_DARK,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
    },
    suggestionText: {
        fontSize: 14,
        color: "rgba(255,255,255,0.7)",
    },
    optionsList: {
        gap: 12,
    },
    sportOption: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: SURFACE_DARK,
        borderRadius: 28,
        paddingVertical: 4,
        paddingHorizontal: 4,
        paddingRight: 24,
        borderWidth: 1,
        borderColor: "transparent",
    },
    sportOptionSelected: {
        backgroundColor: BRAND_PRIMARY,
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
        backgroundColor: "#2a2a30",
        alignItems: "center",
        justifyContent: "center",
    },
    sportIconSelected: {
        backgroundColor: "rgba(255,255,255,0.2)",
    },
    sportLabel: {
        fontSize: 18,
        fontWeight: "600",
        color: "rgba(255,255,255,0.7)",
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
        backgroundColor: SURFACE_DARK,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    moodCardSelected: {
        borderColor: BRAND_PRIMARY,
        backgroundColor: "#232329",
    },
    moodLabel: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff",
    },
    moodLabelSelected: {
        color: "#fff",
    },
    moodSubtitle: {
        fontSize: 14,
        color: "rgba(255,255,255,0.5)",
    },
    venueOption: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 20,
        backgroundColor: "transparent",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#27272a",
    },
    venueOptionSelected: {
        backgroundColor: SURFACE_DARK,
        borderColor: BRAND_PRIMARY,
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
        backgroundColor: "#18181b",
        alignItems: "center",
        justifyContent: "center",
    },
    venueIconSelected: {
        backgroundColor: BRAND_PRIMARY,
    },
    venueTexts: {
        flex: 1,
    },
    venueLabel: {
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 4,
    },
    venueLabelSelected: {
        color: "#fff",
    },
    venueSubtitle: {
        fontSize: 14,
        color: "rgba(255,255,255,0.5)",
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#27272a",
        alignItems: "center",
        justifyContent: "center",
    },
    radioCircleSelected: {
        borderColor: BRAND_PRIMARY,
        backgroundColor: BRAND_PRIMARY,
    },
    budgetList: {
        gap: 16,
        paddingTop: 20,
    },
    budgetOption: {
        height: 72,
        backgroundColor: SURFACE_DARK,
        borderRadius: 36,
        borderWidth: 2,
        borderColor: "transparent",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    budgetOptionSelected: {
        borderColor: BRAND_PRIMARY,
    },
    budgetCenter: {
        alignItems: "center",
    },
    budgetAmount: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
    },
    budgetTier: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 2,
        color: "rgba(255,255,255,0.5)",
        marginTop: 2,
    },
    budgetCheck: {
        position: "absolute",
        right: 24,
    },
});
