import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    ImageBackground,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { COLORS } from "../constants/colors";
import { useStore } from "../store/useStore";
import { usePostHog } from "posthog-react-native";
import { SearchMatchResult, Venue, mobileApi } from "../services/mobileApi";
import { MatchDetailSkeleton } from "../components/Skeleton";

type MatchDetailRoute = {
    params?: {
        matchId?: string;
    };
};

const MatchDetailScreen = ({
    navigation,
    route,
}: {
    navigation: any;
    route: MatchDetailRoute;
}) => {
    const { colors, computedTheme: themeMode } = useStore();
    const posthog = usePostHog();
    const matchId = route.params?.matchId;
    const [match, setMatch] = useState<SearchMatchResult | null>(null);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    // Get user location on mount
    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === "granted") {
                    const location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });
                    setUserLocation({
                        lat: location.coords.latitude,
                        lng: location.coords.longitude,
                    });
                }
            } catch (err) {
                console.warn("Failed to get user location:", err);
            }
        })();
    }, []);

    const loadData = useCallback(async () => {
        if (!matchId) {
            setError("Aucun match sélectionné.");
            setIsLoading(false);
            return;
        }

        try {
            setError(null);
            setIsLoading(true);
            
            // Fetch match details first
            const matchData = await mobileApi.fetchMatchById(matchId);

            if (!matchData) {
                setError("Impossible de trouver ce match.");
                setMatch(null);
                setIsLoading(false);
                return;
            }
            
            setMatch(matchData);

            posthog.capture("match_details_viewed", {
                match_id: matchData.id,
                home_team: matchData.home.name,
                away_team: matchData.away.name,
                league: matchData.league,
            });

            // Fetch venues broadcasting this specific match, sorted by distance from user
            const venueData = await mobileApi.fetchMatchVenues(
                matchId,
                userLocation?.lat,
                userLocation?.lng,
                50 // max 50km radius
            );
            setVenues(venueData);
        } catch (err) {
            console.warn("Failed to load match details", err);
            setError("Impossible de charger les détails du match.");
        } finally {
            setIsLoading(false);
        }
    }, [matchId, userLocation, posthog]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Show up to 4 venues (already sorted by distance from API)
    const recommendedVenues = useMemo(() => venues.slice(0, 4), [venues]);

    const renderState = (message: string, showRetry = false) => (
        <View style={styles.stateWrapper}>
            {showRetry ? (
                <>
                    <Text style={[styles.stateText, { color: colors.textMuted }]}>{message}</Text>
                    <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={loadData} activeOpacity={0.85}>
                        <MaterialIcons name="refresh" size={18} color={colors.white} />
                        <Text style={[styles.retryButtonText, { color: '#fff' }]}>Réessayer</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <ActivityIndicator color={colors.primary} />
                    <Text style={[styles.stateText, { marginTop: 12, color: colors.text }]}>{message}</Text>
                </>
            )}
        </View>
    );

    if (isLoading) {
        return <MatchDetailSkeleton />;
    }

    if (error || !match) {
        return (
            <View style={[styles.container, { justifyContent: "center", backgroundColor: colors.background }]}>
                {renderState(error ?? "Match introuvable", true)}
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={themeMode === 'light' ? 'dark-content' : 'light-content'} />
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
                                    <MaterialIcons name="chevron-left" size={24} color={colors.white} />
                                </TouchableOpacity>

                                <View style={styles.leaguePill}>
                                    <Text style={styles.leaguePillText}>{match.league}</Text>
                                </View>

                                <TouchableOpacity style={styles.circleButton} activeOpacity={0.85}>
                                    <MaterialIcons name="share" size={20} color={colors.white} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.heroBottom}>
                                <View style={styles.heroCard}>
                                    <View style={styles.teamColumn}>
                                        <View style={styles.teamBadge}>
                                            <MaterialIcons name="shield" size={30} color={colors.white} />
                                        </View>
                                        <Text style={styles.teamLabel}>{match.home.name}</Text>
                                    </View>

                                    <View style={styles.heroCenter}>
                                        <Text style={styles.heroTime}>{match.kickoffTime}</Text>
                                        <Text style={[styles.heroStatus, { color: colors.primary }]}>{match.statusLabel}</Text>
                                    </View>

                                    <View style={styles.teamColumn}>
                                        <View style={styles.teamBadge}>
                                            <MaterialIcons name="shield" size={30} color={colors.white} />
                                        </View>
                                        <Text style={styles.teamLabel}>{match.away.name}</Text>
                                    </View>
                                </View>
                            </View>
                        </SafeAreaView>
                    </ImageBackground>
                </View>

                <View style={styles.contentWrapper}>
                    <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.infoHeader}>
                            <View style={[styles.infoIcon, { backgroundColor: 'rgba(244,123,37,0.12)', borderColor: 'rgba(244,123,37,0.3)' }]}>
                                <MaterialIcons name="stadium" size={20} color={colors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Lieu du match</Text>
                                <Text style={[styles.infoValue, { color: colors.text }]}>
                                    {match.stadium}, {match.city}
                                </Text>
                            </View>
                            <TouchableOpacity style={[styles.outlineButton, { borderColor: colors.border }]}>
                                <Text style={[styles.outlineButtonText, { color: colors.text }]}>Itinéraire</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.divider }]} />

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={[styles.primaryAction, styles.glowPrimary, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
                                <MaterialIcons name="calendar-today" size={20} color={colors.white} />
                                <Text style={[styles.primaryActionText, { color: colors.white }]}>Calendrier</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.secondaryAction, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
                                <MaterialIcons name="notifications-active" size={20} color={colors.text} />
                                <Text style={[styles.secondaryActionText, { color: colors.text }]}>Rappel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Bars à proximité</Text>
                            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Lieux diffusant le match en direct</Text>
                        </View>
                        <TouchableOpacity activeOpacity={0.7}>
                            <Text style={[styles.sectionAction, { color: colors.primary }]}>Voir tout</Text>
                        </TouchableOpacity>
                    </View>

                    {recommendedVenues.length > 0 ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
                            style={{ marginHorizontal: -16 }}
                        >
                            {recommendedVenues.map((venue) => (
                                <View key={venue.id} style={[styles.venueCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <View style={styles.venueImageWrapper}>
                                        <Image source={{ uri: venue.image }} style={styles.venueImage} />
                                        <View style={styles.ratingChip}>
                                            <MaterialIcons
                                                name="star"
                                                size={12}
                                                color={colors.primary}
                                                style={{ marginRight: 4 }}
                                            />
                                            <Text style={[styles.ratingChipText, { color: colors.white }]}>{typeof venue.rating === 'number' ? venue.rating.toFixed(1) : (Number(venue.rating) || 0).toFixed(1)}</Text>
                                        </View>
                                        <View style={styles.statusChip}>
                                            <Text style={styles.statusChipText}>
                                                {venue.isOpen ? "Ouvert" : "Fermé"}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.venueBody}>
                                        <View style={styles.venueTitleRow}>
                                            <Text style={[styles.venueName, { color: colors.text }]} numberOfLines={1}>
                                                {venue.name}
                                            </Text>
                                            <View style={styles.distanceBadge}>
                                                <MaterialIcons name="place" size={14} color={colors.primary} />
                                                <Text style={[styles.venueDistance, { color: colors.primary }]}>{venue.distance}</Text>
                                            </View>
                                        </View>
                                        <Text style={[styles.venueMeta, { color: colors.textSecondary }]} numberOfLines={2}>
                                            {venue.address}
                                        </Text>
                                        <TouchableOpacity
                                            style={[styles.venueButton, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
                                            onPress={() =>
                                                navigation.navigate("ReservationsScreen", {
                                                    venue,
                                                    matchId: match.id,
                                                    match,
                                                    matchDateIso: match.dateIso,
                                                })
                                            }
                                        >
                                            <Text style={[styles.venueButtonText, { color: colors.text }]}>RÉSERVER UNE TABLE</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={[styles.emptyVenuesContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <View style={[styles.emptyVenuesIcon, { backgroundColor: 'rgba(244,123,37,0.12)' }]}>
                                <MaterialIcons name="tv-off" size={32} color={colors.primary} />
                            </View>
                            <Text style={[styles.emptyVenuesTitle, { color: colors.text }]}>
                                Aucun bar ne diffuse ce match
                            </Text>
                            <Text style={[styles.emptyVenuesSubtitle, { color: colors.textSecondary }]}>
                                Nous n'avons pas encore trouvé de bars diffusant ce match à proximité.
                            </Text>
                        </View>
                    )}
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
        color: '#FFFFFF',
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
        color: '#FFFFFF',
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
        color: '#FFFFFF',
    },
    heroStatus: {
        marginTop: 4,
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 2,
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
        color: COLORS.textMuted,
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1,
        textTransform: "uppercase",
    },
    infoValue: {
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
        color: '#fff',
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
        color: COLORS.textMuted,
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
        fontSize: 16,
        fontWeight: "700",
    },
    venueDistance: {
        color: COLORS.primary,
        fontWeight: "700",
        fontSize: 12,
    },
    distanceBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        backgroundColor: "rgba(244,123,37,0.12)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    venueMeta: {
        color: COLORS.textSecondary,
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
        color: '#fff',
        fontWeight: "700",
    },
    emptyVenuesContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
        paddingHorizontal: 24,
        borderRadius: 20,
        borderWidth: 1,
    },
    emptyVenuesIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    emptyVenuesTitle: {
        fontSize: 16,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 8,
    },
    emptyVenuesSubtitle: {
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
    },
});

export default MatchDetailScreen;
