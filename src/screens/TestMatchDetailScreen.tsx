import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ImageBackground,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../constants/colors";
import { SearchMatchResult, Venue, testApi } from "../services/testApi";

type MatchDetailRoute = {
    params?: {
        matchId?: string;
    };
};

const TestMatchDetailScreen = ({
    navigation,
    route,
}: {
    navigation: any;
    route: MatchDetailRoute;
}) => {
    const matchId = route.params?.matchId;
    const [match, setMatch] = useState<SearchMatchResult | null>(null);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        if (!matchId) {
            setError("Aucun match sélectionné.");
            setIsLoading(false);
            return;
        }

        try {
            setError(null);
            setIsLoading(true);
            const [matchData, venueData] = await Promise.all([
                testApi.fetchMatchById(matchId),
                testApi.fetchVenues(),
            ]);

            if (!matchData) {
                setError("Impossible de trouver ce match.");
                setMatch(null);
            } else {
                setMatch(matchData);
                setVenues(venueData);
            }
        } catch (err) {
            console.warn("Failed to load match details", err);
            setError("Impossible de charger les détails du match.");
        } finally {
            setIsLoading(false);
        }
    }, [matchId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const recommendedVenues = useMemo(() => venues.slice(0, 4), [venues]);

    const renderState = (message: string, showRetry = false) => (
        <View style={styles.stateWrapper}>
            {showRetry ? (
                <>
                    <Text style={styles.stateText}>{message}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadData} activeOpacity={0.85}>
                        <MaterialIcons name="refresh" size={18} color={COLORS.white} />
                        <Text style={styles.retryButtonText}>Réessayer</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <ActivityIndicator color={COLORS.primary} />
                    <Text style={[styles.stateText, { marginTop: 12 }]}>{message}</Text>
                </>
            )}
        </View>
    );

    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: "center" }]}>
                <StatusBar barStyle="light-content" />
                {renderState("Chargement des détails du match…")}
            </View>
        );
    }

    if (error || !match) {
        return (
            <View style={[styles.container, { justifyContent: "center" }]}>
                {renderState(error ?? "Match introuvable", true)}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
                <View style={styles.heroWrapper}>
                    <ImageBackground source={{ uri: match.heroImage }} style={styles.heroImage}>
                        <LinearGradient
                            colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.85)"]}
                            style={StyleSheet.absoluteFill}
                        />
                        <SafeAreaView style={styles.heroSafe} edges={["top"]}>
                            <View style={styles.heroTopBar}>
                                <TouchableOpacity
                                    style={styles.circleButton}
                                    onPress={() => navigation.goBack?.()}
                                    activeOpacity={0.85}
                                >
                                    <MaterialIcons name="chevron-left" size={24} color={COLORS.white} />
                                </TouchableOpacity>

                                <View style={styles.leaguePill}>
                                    <Text style={styles.leaguePillText}>{match.league}</Text>
                                </View>

                                <TouchableOpacity style={styles.circleButton} activeOpacity={0.85}>
                                    <MaterialIcons name="share" size={20} color={COLORS.white} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.heroBottom}>
                                <View style={styles.heroCard}>
                                    <View style={styles.teamColumn}>
                                        <View style={styles.teamBadge}>
                                            <MaterialIcons name="shield" size={30} color={COLORS.white} />
                                        </View>
                                        <Text style={styles.teamLabel}>{match.home.name}</Text>
                                    </View>

                                    <View style={styles.heroCenter}>
                                        <Text style={styles.heroTime}>{match.kickoffTime}</Text>
                                        <Text style={styles.heroStatus}>{match.statusLabel}</Text>
                                    </View>

                                    <View style={styles.teamColumn}>
                                        <View style={styles.teamBadge}>
                                            <MaterialIcons name="shield" size={30} color={COLORS.white} />
                                        </View>
                                        <Text style={styles.teamLabel}>{match.away.name}</Text>
                                    </View>
                                </View>
                            </View>
                        </SafeAreaView>
                    </ImageBackground>
                </View>

                <View style={styles.contentWrapper}>
                    <View style={styles.infoCard}>
                        <View style={styles.infoHeader}>
                            <View style={styles.infoIcon}>
                                <MaterialIcons name="stadium" size={20} color={COLORS.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoLabel}>Lieu du match</Text>
                                <Text style={styles.infoValue}>
                                    {match.stadium}, {match.city}
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.outlineButton}>
                                <Text style={styles.outlineButtonText}>Itinéraire</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={[styles.primaryAction, styles.glowPrimary]}>
                                <MaterialIcons name="calendar-today" size={20} color={COLORS.background} />
                                <Text style={styles.primaryActionText}>Calendrier</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.secondaryAction}>
                                <MaterialIcons name="notifications-active" size={20} color={COLORS.white} />
                                <Text style={styles.secondaryActionText}>Rappel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>Bars à proximité</Text>
                            <Text style={styles.sectionSubtitle}>Lieux diffusant le match en direct</Text>
                        </View>
                        <TouchableOpacity activeOpacity={0.7}>
                            <Text style={styles.sectionAction}>Voir tout</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
                        style={{ marginHorizontal: -16 }}
                    >
                        {recommendedVenues.map((venue) => (
                            <View key={venue.id} style={styles.venueCard}>
                                <View style={styles.venueImageWrapper}>
                                    <Image source={{ uri: venue.image }} style={styles.venueImage} />
                                    <View style={styles.ratingChip}>
                                        <MaterialIcons
                                            name="star"
                                            size={12}
                                            color={COLORS.primary}
                                            style={{ marginRight: 4 }}
                                        />
                                        <Text style={styles.ratingChipText}>{venue.rating.toFixed(1)}</Text>
                                    </View>
                                    <View style={styles.statusChip}>
                                        <Text style={styles.statusChipText}>
                                            {venue.isOpen ? "Ouvert" : "Fermé"}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.venueBody}>
                                    <View style={styles.venueTitleRow}>
                                        <Text style={styles.venueName} numberOfLines={1}>
                                            {venue.name}
                                        </Text>
                                        <Text style={styles.venueDistance}>{venue.distance}</Text>
                                    </View>
                                    <Text style={styles.venueMeta} numberOfLines={2}>
                                        {venue.address}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.venueButton}
                                        onPress={() =>
                                            navigation.navigate("TestReservationsScreen", {
                                                venue,
                                                matchId: match.id,
                                                match,
                                                matchDateIso: match.dateIso,
                                            })
                                        }
                                    >
                                        <Text style={styles.venueButtonText}>RÉSERVER UNE TABLE</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    heroWrapper: {
        height: "45%",
        minHeight: 360,
    },
    heroImage: {
        flex: 1,
    },
    heroSafe: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    heroTopBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
    },
    circleButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.12)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.15)",
        justifyContent: "center",
        alignItems: "center",
    },
    leaguePill: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.12)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.15)",
    },
    leaguePillText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1,
    },
    heroBottom: {
        flex: 1,
        justifyContent: "flex-end",
        marginBottom: 16,
    },
    heroCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(18,18,22,0.9)",
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },
    teamColumn: {
        flex: 1,
        alignItems: "center",
    },
    teamBadge: {
        width: 56,
        height: 56,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "rgba(255,255,255,0.08)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    teamLabel: {
        color: COLORS.white,
        fontWeight: "700",
        fontSize: 13,
        letterSpacing: 0.5,
    },
    heroCenter: {
        alignItems: "center",
        paddingHorizontal: 8,
    },
    heroTime: {
        fontSize: 28,
        fontWeight: "800",
        color: COLORS.white,
    },
    heroStatus: {
        marginTop: 4,
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 2,
        color: COLORS.primary,
    },
    contentWrapper: {
        marginTop: -30,
        paddingHorizontal: 16,
    },
    infoCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },
    infoHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    infoIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "rgba(244,123,37,0.12)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(244,123,37,0.3)",
    },
    infoLabel: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1,
        textTransform: "uppercase",
    },
    infoValue: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "600",
        marginTop: 4,
    },
    outlineButton: {
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: 18,
        paddingVertical: 8,
    },
    outlineButtonText: {
        color: COLORS.white,
        fontWeight: "700",
        fontSize: 12,
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.08)",
        marginVertical: 18,
    },
    actionRow: {
        flexDirection: "row",
        gap: 12,
    },
    primaryAction: {
        flex: 1,
        backgroundColor: COLORS.primary,
        borderRadius: 999,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    glowPrimary: {
        shadowColor: COLORS.primary,
        shadowOpacity: 0.35,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },
    },
    primaryActionText: {
        color: COLORS.background,
        fontWeight: "800",
        letterSpacing: 0.6,
    },
    secondaryAction: {
        flex: 1,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.15)",
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    secondaryActionText: {
        color: COLORS.white,
        fontWeight: "700",
    },
    section: {
        marginTop: 32,
        paddingHorizontal: 16,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    sectionTitle: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: "700",
    },
    sectionSubtitle: {
        color: "rgba(255,255,255,0.5)",
        marginTop: 4,
        fontSize: 12,
    },
    sectionAction: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 1.2,
    },
    venueCard: {
        width: 260,
        borderRadius: 24,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
        overflow: "hidden",
    },
    venueImageWrapper: {
        height: 170,
        position: "relative",
    },
    venueImage: {
        width: "100%",
        height: "100%",
    },
    ratingChip: {
        position: "absolute",
        top: 12,
        right: 12,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: "rgba(0,0,0,0.65)",
        borderRadius: 999,
    },
    ratingChipText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: "700",
    },
    statusChip: {
        position: "absolute",
        bottom: 14,
        left: 14,
        backgroundColor: "rgba(34,197,94,0.9)",
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    statusChipText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 1,
    },
    venueBody: {
        padding: 16,
        gap: 8,
    },
    venueTitleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
    },
    venueName: {
        flex: 1,
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "700",
    },
    venueDistance: {
        color: COLORS.primary,
        fontWeight: "700",
        fontSize: 12,
    },
    venueMeta: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 12,
    },
    venueButton: {
        marginTop: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.15)",
        paddingVertical: 12,
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    venueButtonText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 1,
    },
    stateWrapper: {
        alignItems: "center",
        padding: 24,
    },
    stateText: {
        color: COLORS.text,
        textAlign: "center",
        fontSize: 14,
        marginTop: 6,
    },
    retryButton: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 999,
        backgroundColor: COLORS.primary,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    retryButtonText: {
        color: COLORS.background,
        fontWeight: "700",
    },
});

export default TestMatchDetailScreen;
