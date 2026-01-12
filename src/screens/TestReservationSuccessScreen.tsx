import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";

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

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.iconGlow}>
                        <View style={styles.iconCircle}>
                            <MaterialIcons name="check" size={42} color={COLORS.white} />
                        </View>
                    </View>
                    <Text style={styles.title}>Réservation Confirmée !</Text>
                    <Text style={styles.subtitle}>Votre table vous attend.</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <ImageBackground source={{ uri: image }} style={styles.cardImage} imageStyle={styles.cardImageInner} />
                        <View style={styles.cardVenueInfo}>
                            <Text style={styles.cardVenueLabel}>VENUE</Text>
                            <Text style={styles.cardVenueName}>{venueName}</Text>
                            <View style={styles.cardVenueAddressRow}>
                                <MaterialIcons name="location-on" size={14} color={COLORS.textSecondary} />
                                <Text style={styles.cardVenueAddress}>{address}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                            <View style={styles.detailIcon}>
                                <MaterialIcons name="calendar-month" size={20} color={COLORS.primary} />
                            </View>
                            <View>
                                <Text style={styles.detailLabel}>Date</Text>
                                <Text style={styles.detailValue}>{dateLabel}</Text>
                            </View>
                        </View>

                        <View style={[styles.detailItem, styles.detailItemRight]}>
                            <View style={styles.detailIcon}>
                                <MaterialIcons name="schedule" size={20} color={COLORS.primary} />
                            </View>
                            <View>
                                <Text style={styles.detailLabel}>Heure</Text>
                                <Text style={styles.detailValue}>{time}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.detailItem}>
                        <View style={styles.detailIcon}>
                            <MaterialIcons name="group" size={20} color={COLORS.primary} />
                        </View>
                        <View>
                            <Text style={styles.detailLabel}>Invités</Text>
                            <Text style={styles.detailValue}>{guestsLabel}</Text>
                        </View>
                    </View>

                    <View style={styles.ticketCut}>
                        <View style={styles.cutCircle} />
                        <View style={styles.dashedLine} />
                        <View style={styles.cutCircle} />
                    </View>

                    <Text style={styles.reference}>Référence: {reference}</Text>

                    <View style={styles.barcode}>
                        {BAR_SEGMENTS.map((width, idx) => (
                            <View key={idx} style={[styles.barSegment, { width }]} />
                        ))}
                    </View>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.primaryButton}>
                        <MaterialIcons name="qr-code-2" size={22} color={COLORS.white} />
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

const BAR_SEGMENTS = [4, 2, 1, 3, 1, 5, 2, 1, 4, 2, 1, 3, 1, 2, 4];

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 32,
        paddingBottom: 24,
        justifyContent: "space-between",
    },
    header: {
        alignItems: "center",
        gap: 12,
    },
    iconGlow: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: "rgba(244, 123, 37, 0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
    iconCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: COLORS.primary,
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 18,
    },
    title: {
        color: COLORS.white,
        fontSize: 30,
        fontWeight: "bold",
        textAlign: "center",
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 16,
        textAlign: "center",
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 28,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: "#000",
        shadowOpacity: 0.35,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 15 },
    },
    cardHeader: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 20,
    },
    cardImage: {
        width: 72,
        height: 72,
        borderRadius: 20,
        overflow: "hidden",
    },
    cardImageInner: {
        borderRadius: 20,
    },
    cardVenueInfo: {
        flex: 1,
        justifyContent: "center",
        gap: 4,
    },
    cardVenueLabel: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 1,
    },
    cardVenueName: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "bold",
    },
    cardVenueAddressRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    cardVenueAddress: {
        color: COLORS.textSecondary,
        fontSize: 13,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    detailItemRight: {
        justifyContent: "flex-end",
    },
    detailIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(244, 123, 37, 0.12)",
        alignItems: "center",
        justifyContent: "center",
    },
    detailLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
    },
    detailValue: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "bold",
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.divider,
        marginVertical: 18,
    },
    ticketCut: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 16,
    },
    cutCircle: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: COLORS.background,
    },
    dashedLine: {
        flex: 1,
        height: 1,
        borderStyle: "dashed",
        borderWidth: 1,
        borderColor: COLORS.divider,
        marginHorizontal: 10,
    },
    reference: {
        color: COLORS.textSecondary,
        textAlign: "center",
        marginBottom: 16,
        fontSize: 13,
    },
    barcode: {
        height: 48,
        borderRadius: 12,
        backgroundColor: COLORS.surfaceAlt,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },
    barSegment: {
        height: "80%",
        backgroundColor: COLORS.white,
        borderRadius: 2,
    },
    actions: {
        gap: 12,
    },
    primaryButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        backgroundColor: COLORS.primary,
        borderRadius: 18,
        height: 58,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 20,
    },
    primaryButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "bold",
    },
    secondaryButton: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.surfaceGlass,
        height: 52,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.surfaceDark,
    },
    secondaryButtonText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: "600",
    },
});

export default TestReservationSuccessScreen;
