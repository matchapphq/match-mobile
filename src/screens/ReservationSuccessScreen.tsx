import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Animated, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

// Define strict colors from the HTML/Tailwind config
import { useStore } from "../store/useStore";

// Removed local THEME constant in favor of useStore
// const THEME = ...

type SuccessParams = {
    venueName?: string;
    address?: string;
    dateLabel?: string;
    time?: string;
    guestsLabel?: string;
    matchTitle?: string;
    reference?: string;
    image?: string;
};

const DEFAULT_IMAGE =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDFKCVuOq4v4pl8GgumWkDkahxAgQfU5tllCtpxZGcY0k37BRwxsYjlp0QVSwkn52Y5nwqaOezIeVt5fnv8yBCYBNcRHV7bWa-owzsJnQKABidkqvB9pqnfRBjdxaNR6DZNBoYWyLC4OzbSAh2pk5KB8XK3Ki7zbkdr5eamtyFnv7dkfnojXaET-Hvr1LWwLe_c8TlWsydZRX1o5Hizo5AXMvuUlFbGYOOKcibcZ6dF1We8FNKOhydp80y-vbvsInR_weoOJ4yD27Kr";

const ReservationSuccessScreen = ({ navigation, route }: { navigation: any; route: { params?: SuccessParams } }) => {
    const { colors } = useStore();
    const {
        venueName = "THE KOP BAR",
        address = "12 Rue de la Soif, Paris",
        dateLabel = "Ven 24 Nov",
        time = "20:45",
        guestsLabel = "4 personnes",
        matchTitle = "Match de Football",
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
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Animated.View style={[styles.iconWrapper, { transform: [{ scale: scaleAnim }] }]}>
                        <View style={[styles.iconGlow, { backgroundColor: 'rgba(244, 123, 37, 0.2)', shadowColor: colors.primary }]} />
                        <View style={[styles.iconCircle, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
                            <MaterialIcons name="check" size={48} color={colors.white} />
                        </View>
                    </Animated.View>

                    <Text style={[styles.title, { color: colors.text }]}>Réservation Confirmée !</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Votre table vous attend.</Text>
                </View>

                {/* Main Card */}
                <View style={styles.cardContainer}>
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        {/* Venue Info Header */}
                        <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
                            <ImageBackground source={{ uri: image }} style={styles.venueImage} imageStyle={{ borderRadius: 8 }} />
                            <View style={styles.venueInfo}>
                                <Text style={[styles.venueLabel, { color: colors.primary }]}>VENUE</Text>
                                <Text style={[styles.venueName, { color: colors.text }]}>{venueName}</Text>
                                <View style={styles.matchRow}>
                                    <MaterialIcons name="live-tv" size={16} color={colors.primary} />
                                    <Text style={[styles.matchText, { color: colors.primary }]}>{matchTitle}</Text>
                                </View>
                                <View style={styles.addressRow}>
                                    <MaterialIcons name="location-on" size={16} color={colors.textSecondary} />
                                    <Text style={[styles.venueAddress, { color: colors.textSecondary }]}>{address}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Date & Time Row */}
                        <View style={styles.detailsRow}>
                            <View style={styles.detailItem}>
                                <View style={[styles.detailIconContainer, { backgroundColor: 'rgba(244, 123, 37, 0.1)' }]}>
                                    <MaterialIcons name="calendar-month" size={20} color={colors.primary} />
                                </View>
                                <View>
                                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>DATE</Text>
                                    <Text style={[styles.detailValue, { color: colors.text }]}>{dateLabel}</Text>
                                </View>
                            </View>

                            <View style={[styles.detailItem, { flexDirection: "row-reverse" }]}>
                                <View style={[styles.detailIconContainer, { backgroundColor: 'rgba(244, 123, 37, 0.1)' }]}>
                                    <MaterialIcons name="schedule" size={20} color={colors.primary} />
                                </View>
                                <View style={{ alignItems: "flex-end" }}>
                                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>HEURE</Text>
                                    <Text style={[styles.detailValue, { color: colors.text }]}>{time}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        {/* Guests Row - Explicitly requested to be fixed */}
                        <View style={styles.detailsRow}>
                            <View style={styles.detailItem}>
                                <View style={[styles.detailIconContainer, { backgroundColor: 'rgba(244, 123, 37, 0.1)' }]}>
                                    <MaterialIcons name="group" size={20} color={colors.primary} />
                                </View>
                                <View>
                                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>INVITÉS</Text>
                                    <Text style={[styles.detailValue, { color: colors.text }]}>{guestsLabel}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Dashed Cut Line */}
                        <View style={styles.cutLineContainer}>
                            <View style={[styles.cutNotchLeft, { backgroundColor: colors.background }]} />
                            <View style={[styles.dashedLine, { borderColor: colors.border }]} />
                            <View style={[styles.cutNotchRight, { backgroundColor: colors.background }]} />
                        </View>

                        {/* Reference & Barcode */}
                        <View style={styles.footerSection}>
                            <Text style={[styles.referenceText, { color: colors.textSecondary }]}>Reference: {reference}</Text>
                            <View style={[styles.barcodeContainer, { backgroundColor: colors.surfaceAlt }]}>
                                <View style={styles.barcodeBars}>
                                    {BAR_SEGMENTS.map((width, idx) => (
                                        <View
                                            key={idx}
                                            style={[
                                                styles.barSegment,
                                                { width, height: idx % 2 === 0 ? 24 : 16, backgroundColor: colors.text }, // Vary height for visual flair
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
                    <TouchableOpacity 
                        style={[styles.primaryButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
                        onPress={() => navigation.navigate("Tab", { 
                            screen: "Reservations", 
                            params: { reservationId: reference } 
                        })}
                    >
                        <MaterialIcons name="qr-code-2" size={24} color={colors.white} />
                        <Text style={[styles.primaryButtonText, { color: colors.white }]}>Voir mon QR Code</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: 'transparent' }]} onPress={() => navigation.navigate("Tab")}>
                        <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Retour à l'accueil</Text>
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
        // To simulate the blur-xl effect
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: "center",
        justifyContent: "center",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8,
        lineHeight: 38,
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
    },
    cardContainer: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    card: {
        borderRadius: 12,
        borderWidth: 1,
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
        fontWeight: "600",
        letterSpacing: 0.5,
        marginBottom: 2,
        textTransform: "uppercase",
    },
    venueName: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 4,
    },
    matchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginBottom: 4,
    },
    matchText: {
        fontSize: 14,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    addressRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    venueAddress: {
        fontSize: 14,
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
        alignItems: "center",
        justifyContent: "center",
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: "600",
    },
    divider: {
        height: 1,
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
        borderStyle: "dashed",
        marginHorizontal: 6,
    },
    cutNotchLeft: {
        position: "absolute",
        left: -12,
        width: 24,
        height: 24,
        borderRadius: 12,
        zIndex: 1,
    },
    cutNotchRight: {
        position: "absolute",
        right: -12,
        width: 24,
        height: 24,
        borderRadius: 12,
        zIndex: 1,
    },
    footerSection: {
        alignItems: "center",
        paddingBottom: 24,
        paddingTop: 8,
    },
    referenceText: {
        fontSize: 12,
        marginBottom: 12,
    },
    barcodeContainer: {
        width: "90%",
        height: 48,
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
        borderRadius: 1,
    },
    actions: {
        paddingHorizontal: 20,
        gap: 12,
    },
    primaryButton: {
        height: 60,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 6,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    secondaryButton: {
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: "500",
    },
});

export default ReservationSuccessScreen;
