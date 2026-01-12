import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Animated,
    Pressable,
    Dimensions,
    Easing,
    Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";

const { height } = Dimensions.get("window");

export type FilterSelections = {
    sports: string[];
    venues: string[];
    ambiances: string[];
    food: string[];
    price: string;
};

export const DEFAULT_FILTER_SELECTIONS: FilterSelections = {
    sports: ["Football"],
    venues: ["Sports Bar"],
    ambiances: ["Chill"],
    food: ["Bières Artisanales"],
    price: "€€",
};

const SPORTS_OPTIONS = ["Football", "Rugby", "Tennis", "Basket", "MMA"];
const VENUE_OPTIONS = ["Sports Bar", "Pub Irlandais", "Restaurant", "Rooftop"];
const AMBIANCE_OPTIONS = ["Festif", "Stade", "Chill", "Cosy"];
const FOOD_OPTIONS = ["Happy Hour", "Bières Artisanales", "Burgers", "Pizza", "Tapas"];
const PRICE_OPTIONS = ["€", "€€", "€€€"];

type Props = {
    visible: boolean;
    initialSelections?: FilterSelections;
    onClose: () => void;
    onApply: (selections: FilterSelections) => void;
};

const TestMapScreenFilter = ({ visible, initialSelections, onClose, onApply }: Props) => {
    const sheetAnim = useRef(new Animated.Value(0)).current;
    const [rendered, setRendered] = useState(visible);
    const [selections, setSelections] = useState<FilterSelections>(
        initialSelections ?? DEFAULT_FILTER_SELECTIONS,
    );
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (visible) {
            setSelections(initialSelections ?? DEFAULT_FILTER_SELECTIONS);
            setRendered(true);
            Animated.timing(sheetAnim, {
                toValue: 1,
                duration: 280,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(sheetAnim, {
                toValue: 0,
                duration: 240,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (finished) {
                    setRendered(false);
                }
            });
        }
    }, [visible, initialSelections, sheetAnim]);

    const toggleSelection = (key: keyof FilterSelections, value: string) => {
        setSelections((prev) => {
            if (key === "price") {
                return { ...prev, price: value };
            }
            const current = prev[key] as string[];
            const exists = current.includes(value);
            const updated = exists ? current.filter((item) => item !== value) : [...current, value];
            return { ...prev, [key]: updated };
        });
    };

    const handleApply = () => {
        onApply(selections);
    };

    const handleReset = () => {
        setSelections(DEFAULT_FILTER_SELECTIONS);
    };

    const filterOptions = useMemo(
        () => [
            {
                title: "Sports",
                options: SPORTS_OPTIONS,
                key: "sports" as const,
                highlight: "Football",
            },
            {
                title: "Lieux",
                options: VENUE_OPTIONS,
                key: "venues" as const,
                highlight: "Sports Bar",
            },
            {
                title: "Ambiance",
                options: AMBIANCE_OPTIONS,
                key: "ambiances" as const,
                highlight: "Chill",
            },
            {
                title: "Food & Drinks",
                options: FOOD_OPTIONS,
                key: "food" as const,
                highlight: "Bières Artisanales",
            },
        ],
        [],
    );

    if (!rendered) {
        return null;
    }

    const backdropOpacity = sheetAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.8],
    });

    const translateY = sheetAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [height, 0],
    });

    return (
        <Modal
            visible={rendered}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
            </Animated.View>
            <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
                <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                    <TouchableOpacity style={styles.headerButton} onPress={onClose}>
                        <MaterialIcons name="close" size={22} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Filtres</Text>
                    <TouchableOpacity onPress={handleReset}>
                        <Text style={styles.reset}>Réinitialiser</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 180 }]}
                    showsVerticalScrollIndicator={false}
                >
                    {filterOptions.map((section) => (
                        <View key={section.title} style={styles.section}>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                            <View style={styles.chipWrap}>
                                {section.options.map((option) => {
                                    const active = (selections[section.key] as string[]).includes(option);
                                    const highlighted = section.highlight === option;
                                    return (
                                        <TouchableOpacity
                                            key={option}
                                            style={[
                                                styles.chip,
                                                highlighted && !active && styles.chipHighlighted,
                                                active && styles.chipActive,
                                            ]}
                                            onPress={() => toggleSelection(section.key, option)}
                                            activeOpacity={0.85}
                                        >
                                            <Text
                                                style={[
                                                    styles.chipLabel,
                                                    highlighted && !active && styles.chipLabelHighlighted,
                                                    active && styles.chipLabelActive,
                                                ]}
                                            >
                                                {option}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    ))}

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Prix</Text>
                        <View style={styles.priceRow}>
                            {PRICE_OPTIONS.map((price) => {
                                const active = selections.price === price;
                                return (
                                    <TouchableOpacity
                                        key={price}
                                        style={[styles.priceButton, active && styles.priceButtonActive]}
                                        onPress={() => toggleSelection("price", price)}
                                        activeOpacity={0.85}
                                    >
                                        <Text
                                            style={[styles.priceLabel, active && styles.priceLabelActive]}
                                        >
                                            {price}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </ScrollView>

                <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
                    <TouchableOpacity style={styles.applyButton} activeOpacity={0.9} onPress={handleApply}>
                        <Text style={styles.applyLabel}>VALIDER</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Modal>
    );
};

export default TestMapScreenFilter;

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#09090b",
        zIndex: 80,
    },
    sheet: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: COLORS.backgroundDark,
        zIndex: 90,
    },
    header: {
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "rgba(255,255,255,0.08)",
    },
    headerButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    title: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: "700",
    },
    reset: {
        color: COLORS.textMuted,
        fontSize: 14,
        fontWeight: "600",
    },
    content: {
        padding: 20,
        paddingBottom: 160,
        gap: 24,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: "700",
    },
    chipWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: COLORS.surfaceDark,
    },
    chipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
    },
    chipHighlighted: {
        backgroundColor: "rgba(244,123,37,0.15)",
        borderColor: "rgba(244,123,37,0.4)",
    },
    chipLabel: {
        color: COLORS.textMuted,
        fontWeight: "600",
    },
    chipLabelActive: {
        color: COLORS.text,
    },
    chipLabelHighlighted: {
        color: COLORS.primary,
    },
    priceRow: {
        flexDirection: "row",
        gap: 12,
    },
    priceButton: {
        flex: 1,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: COLORS.surfaceDark,
        paddingVertical: 14,
        alignItems: "center",
    },
    priceButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
    },
    priceLabel: {
        color: COLORS.textMuted,
        fontWeight: "700",
        fontSize: 14,
    },
    priceLabelActive: {
        color: COLORS.text,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 32,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "rgba(255,255,255,0.08)",
        backgroundColor: "rgba(0,0,0,0.7)",
    },
    applyButton: {
        height: 56,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: COLORS.primary,
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 10 },
    },
    applyLabel: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: "800",
        letterSpacing: 1,
    },
});
