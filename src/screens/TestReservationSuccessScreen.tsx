import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Animated, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

// Define strict colors from the HTML/Tailwind config
const THEME = {
    colors: {
        primary: "#f47b25", // bg-primary
        background: "#0b0b0f", // dark:bg-brand-bg
        card: "#1c1c21", // dark:bg-brand-card
        text: "#FFFFFF", // dark:text-white
        textSecondary: "#9ca3af", // dark:text-gray-400 (approximate)
        divider: "rgba(255, 255, 255, 0.1)", // dark:border-white/10
        surfaceAlt: "rgba(255, 255, 255, 0.05)", // dark:bg-white/5
        iconBg: "rgba(244, 123, 37, 0.1)", // bg-primary/10
    },
};

type SuccessParams = {
    venueName?: string;
    address?: string;
    dateLabel?: string;
    time?: string;
    guestsLabel?: string;
    reference?: string;
    image?: string;
};

const DEFAULT_IMAGE =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDFKCVuOq4v4pl8GgumWkDkahxAgQfU5tllCtpxZGcY0k37BRwxsYjlp0QVSwkn52Y5nwqaOezIeVt5fnv8yBCYBNcRHV7bWa-owzsJnQKABidkqvB9pqnfRBjdxaNR6DZNBoYWyLC4OzbSAh2pk5KB8XK3Ki7zbkdr5eamtyFnv7dkfnojXaET-Hvr1LWwLe_c8TlWsydZRX1o5Hizo5AXMvuUlFbGYOOKcibcZ6dF1We8FNKOhydp80y-vbvsInR_weoOJ4yD27Kr";

const TestReservationSuccessScreen = ({ navigation, route }: { navigation: any; route: { params?: SuccessParams } }) => {
    const {
        venueName = "THE KOP BAR",
        address = "12 Rue de la Soif, Paris",
        dateLabel = "Ven 24 Nov",
        time = "20:45",
        guestsLabel = "4 personnes",
        reference = "#BK-7829-XP",
        image = DEFAULT_IMAGE,
    } = route.params ?? {};

    // Animation for the checkmark pop
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
            <View style={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Animated.View style={[styles.iconWrapper, { transform: [{ scale: scaleAnim }] }]}>
                        <View style={styles.iconGlow} />
                        <View style={styles.iconCircle}>
                            <MaterialIcons name="check" size={48} color="#FFFFFF" />
                        </View>
                    </Animated.View>

                    <Text style={styles.title}>Réservation Confirmée !</Text>
                    <Text style={styles.subtitle}>Votre table vous attend.</Text>
                </View>

                {/* Main Card */}
                <View style={styles.cardContainer}>
                    <View style={styles.card}>
                        {/* Venue Info Header */}
                        <View style={styles.cardHeader}>
                            <ImageBackground source={{ uri: image }} style={styles.venueImage} imageStyle={{ borderRadius: 8 }} />
                            <View style={styles.venueInfo}>
                                <Text style={styles.venueLabel}>VENUE</Text>
                                <Text style={styles.venueName}>{venueName}</Text>
                                <View style={styles.addressRow}>
                                    <MaterialIcons name="location-on" size={16} color={THEME.colors.textSecondary} />
                                    <Text style={styles.venueAddress}>{address}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Date & Time Row */}
                        <View style={styles.detailsRow}>
                            <View style={styles.detailItem}>
                                <View style={styles.detailIconContainer}>
                                    <MaterialIcons name="calendar-month" size={20} color={THEME.colors.primary} />
                                </View>
                                <View>
                                    <Text style={styles.detailLabel}>DATE</Text>
                                    <Text style={styles.detailValue}>{dateLabel}</Text>
                                </View>
                            </View>

                            <View style={[styles.detailItem, { flexDirection: "row-reverse" }]}>
                                <View style={styles.detailIconContainer}>
                                    <MaterialIcons name="schedule" size={20} color={THEME.colors.primary} />
                                </View>
                                <View style={{ alignItems: "flex-end" }}>
                                    <Text style={styles.detailLabel}>HEURE</Text>
                                    <Text style={styles.detailValue}>{time}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Guests Row - Explicitly requested to be fixed */}
                        <View style={styles.detailsRow}>
                            <View style={styles.detailItem}>
                                <View style={styles.detailIconContainer}>
                                    <MaterialIcons name="group" size={20} color={THEME.colors.primary} />
                                </View>
                                <View>
                                    <Text style={styles.detailLabel}>INVITÉS</Text>
                                    <Text style={styles.detailValue}>{guestsLabel}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Dashed Cut Line */}
                        <View style={styles.cutLineContainer}>
                            <View style={styles.cutNotchLeft} />
                            <View style={styles.dashedLine} />
                            <View style={styles.cutNotchRight} />
                        </View>

                        {/* Reference & Barcode */}
                        <View style={styles.footerSection}>
                            <Text style={styles.referenceText}>Reference: {reference}</Text>
                            <View style={styles.barcodeContainer}>
                                <View style={styles.barcodeBars}>
                                    {BAR_SEGMENTS.map((width, idx) => (
                                        <View
                                            key={idx}
                                            style={[
                                                styles.barSegment,
                                                { width, height: idx % 2 === 0 ? 24 : 16 }, // Vary height for visual flair
                                            ]}
                                        />
                                    ))}
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Bottom Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.primaryButton}>
                        <MaterialIcons name="qr-code-2" size={24} color="#FFFFFF" />
                        <Text style={styles.primaryButtonText}>Voir mon QR Code</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("TestTab")}>
                        <Text style={styles.secondaryButtonText}>Retour à l'accueil</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const BAR_SEGMENTS = [4, 2, 1, 3, 1, 5, 2, 1, 4, 3, 2, 5, 1, 2, 4];

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    container: {
        flex: 1,
        justifyContent: "space-between",
        paddingBottom: 20,
    },
    header: {
        alignItems: "center",
        paddingTop: 40,
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    iconWrapper: {
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        width: 120,
        height: 120,
        marginBottom: 16,
    },
    iconGlow: {
        position: "absolute",
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: "rgba(244, 123, 37, 0.2)",
        // To simulate the blur-xl effect
        shadowColor: THEME.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: THEME.colors.primary,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: THEME.colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: THEME.colors.text,
        textAlign: "center",
        marginBottom: 8,
        lineHeight: 38,
    },
    subtitle: {
        fontSize: 16,
        color: THEME.colors.textSecondary,
        textAlign: "center",
    },
    cardContainer: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    card: {
        backgroundColor: THEME.colors.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    cardHeader: {
        flexDirection: "row",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: THEME.colors.divider,
        alignItems: "center",
        gap: 16,
    },
    venueImage: {
        width: 64,
        height: 64,
        borderRadius: 8,
        backgroundColor: "#333",
    },
    venueInfo: {
        flex: 1,
    },
    venueLabel: {
        fontSize: 12,
        color: THEME.colors.primary,
        fontWeight: "600",
        letterSpacing: 0.5,
        marginBottom: 2,
        textTransform: "uppercase",
    },
    venueName: {
        fontSize: 18,
        fontWeight: "bold",
        color: THEME.colors.text,
        marginBottom: 4,
    },
    addressRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    venueAddress: {
        fontSize: 14,
        color: THEME.colors.textSecondary,
    },
    detailsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    detailIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: THEME.colors.iconBg,
        alignItems: "center",
        justifyContent: "center",
    },
    detailLabel: {
        fontSize: 12,
        color: THEME.colors.textSecondary,
        fontWeight: "600",
        textTransform: "uppercase",
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: "600",
        color: THEME.colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: THEME.colors.divider,
        marginHorizontal: 20,
    },
    cutLineContainer: {
        height: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        marginVertical: 8,
    },
    dashedLine: {
        flex: 1,
        height: 1,
        borderWidth: 1,
        borderColor: THEME.colors.divider,
        borderStyle: "dashed",
        marginHorizontal: 6,
    },
    cutNotchLeft: {
        position: "absolute",
        left: -12,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: THEME.colors.background,
        zIndex: 1,
    },
    cutNotchRight: {
        position: "absolute",
        right: -12,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: THEME.colors.background,
        zIndex: 1,
    },
    footerSection: {
        alignItems: "center",
        paddingBottom: 24,
        paddingTop: 8,
    },
    referenceText: {
        fontSize: 12,
        color: THEME.colors.textSecondary,
        marginBottom: 12,
    },
    barcodeContainer: {
        width: "90%",
        height: 48,
        backgroundColor: THEME.colors.surfaceAlt,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
    },
    barcodeBars: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        opacity: 0.6,
    },
    barSegment: {
        backgroundColor: THEME.colors.text,
        borderRadius: 1,
    },
    actions: {
        paddingHorizontal: 20,
        gap: 12,
    },
    primaryButton: {
        backgroundColor: THEME.colors.primary,
        height: 60,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        shadowColor: THEME.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 6,
    },
    primaryButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    secondaryButton: {
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "transparent", // or transparent
        backgroundColor: THEME.colors.card, // brand-secondary
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "500",
    },
});

export default TestReservationSuccessScreen;
