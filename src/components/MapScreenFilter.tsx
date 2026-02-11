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
import { useStore } from "../store/useStore";

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

const MapScreenFilter = ({ visible, initialSelections, onClose, onApply }: Props) => {
    const { colors, themeMode } = useStore();
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
            <Animated.View style={[
                styles.sheet,
                {
                    transform: [{ translateY }],
                    backgroundColor: colors.background // Dynamic background
                }
            ]}>
                <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.divider }]}>
                    <TouchableOpacity
                        style={[styles.headerButton, { backgroundColor: colors.surfaceAlt }]}
                        onPress={onClose}
                    >
                        <MaterialIcons name="close" size={22} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>Filtres</Text>
                    <TouchableOpacity onPress={handleReset}>
                        <Text style={[styles.reset, { color: colors.textMuted }]}>Réinitialiser</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 180 }]}
                    showsVerticalScrollIndicator={false}
                >
                    {filterOptions.map((section) => (
                        <View key={section.title} style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
                            <View style={styles.chipWrap}>
                                {section.options.map((option) => {
                                    const active = (selections[section.key] as string[]).includes(option);
                                    const highlighted = section.highlight === option;
                                    return (
                                        <TouchableOpacity
                                            key={option}
                                            style={[
                                                styles.chip,
                                                {
                                                    backgroundColor: active ? colors.primary : colors.surfaceAlt,
                                                    borderColor: active ? colors.primary : colors.border
                                                },
                                                highlighted && !active && {
                                                    backgroundColor: themeMode === 'light' ? 'rgba(244,123,37,0.1)' : 'rgba(244,123,37,0.15)',
                                                    borderColor: 'rgba(244,123,37,0.4)'
                                                },
                                                active && {
                                                    shadowColor: colors.primary,
                                                    shadowOpacity: 0.3,
                                                    shadowRadius: 10,
                                                    shadowOffset: { width: 0, height: 6 },
                                                    elevation: 6
                                                }
                                            ]}
                                            onPress={() => toggleSelection(section.key, option)}
                                            activeOpacity={0.85}
                                        >
                                            <Text
                                                style={[
                                                    styles.chipLabel,
                                                    { color: active ? colors.white : colors.textMuted },
                                                    highlighted && !active && { color: colors.primary },
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
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Prix</Text>
                        <View style={styles.priceRow}>
                            {PRICE_OPTIONS.map((price) => {
                                const active = selections.price === price;
                                return (
                                    <TouchableOpacity
                                        key={price}
                                        style={[
                                            styles.priceButton,
                                            {
                                                backgroundColor: active ? colors.primary : colors.surfaceAlt,
                                                borderColor: active ? colors.primary : colors.border
                                            },
                                            active && {
                                                shadowColor: colors.primary,
                                                shadowOpacity: 0.3,
                                                shadowRadius: 12,
                                                shadowOffset: { width: 0, height: 6 },
                                                elevation: 6
                                            }
                                        ]}
                                        onPress={() => toggleSelection("price", price)}
                                        activeOpacity={0.85}
                                    >
                                        <Text
                                            style={[
                                                styles.priceLabel,
                                                { color: active ? colors.white : colors.textMuted }
                                            ]}
                                        >
                                            {price}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </ScrollView>

                <View style={[styles.footer, {
                    paddingBottom: insets.bottom + 24,
                    borderTopColor: colors.divider,
                    backgroundColor: themeMode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.7)'
                }]}>
                    <TouchableOpacity
                        style={[
                            styles.applyButton,
                            {
                                backgroundColor: colors.primary,
                                shadowColor: colors.primary
                            }
                        ]}
                        activeOpacity={0.9}
                        onPress={handleApply}
                    >
                        <Text style={[styles.applyLabel, { color: colors.white }]}>VALIDER</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Modal>
    );
};

export default MapScreenFilter;

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.6)",
        zIndex: 80,
    },
    sheet: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        // backgroundColor handled dynamically
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
        // borderBottomColor handled dynamically
    },
    headerButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        // backgroundColor handled dynamically
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        // color handled dynamically
    },
    reset: {
        fontSize: 14,
        fontWeight: "600",
        // color handled dynamically
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
        fontSize: 16,
        fontWeight: "700",
        // color handled dynamically
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
        // colors handled dynamically
    },
    chipLabel: {
        fontWeight: "600",
        // color handled dynamically
    },
    priceRow: {
        flexDirection: "row",
        gap: 12,
    },
    priceButton: {
        flex: 1,
        borderRadius: 16,
        borderWidth: 1,
        paddingVertical: 14,
        alignItems: "center",
        // colors handled dynamically
    },
    priceLabel: {
        fontWeight: "700",
        fontSize: 14,
        // color handled dynamically
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 32,
        borderTopWidth: StyleSheet.hairlineWidth,
        // colors handled dynamically
    },
    applyButton: {
        height: 56,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 10 },
        elevation: 8,
    },
    applyLabel: {
        fontSize: 16,
        fontWeight: "800",
        letterSpacing: 1,
        // color handled dynamically
    },
});
