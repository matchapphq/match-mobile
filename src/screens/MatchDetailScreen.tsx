import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform,
    Dimensions
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { COLORS } from "../constants/colors";
import { useStore } from "../store/useStore";
import { usePostHog } from "posthog-react-native";
import { SearchMatchResult, Venue, VenueMatch, mobileApi } from "../services/mobileApi";
import { MatchDetailSkeleton } from "../components/Skeleton";
import { sharing } from "../utils/sharing";

type MatchDetailRoute = {
    params?: {
        matchId?: string;
    };
};

const { width } = Dimensions.get("window");

const MatchDetailScreen = ({
    navigation,
    route,
}: {
    navigation: any;
    route: MatchDetailRoute;
}) => {
    const { colors, computedTheme: themeMode } = useStore();
    const insets = useSafeAreaInsets();
    const posthog = usePostHog();
    const matchId = route.params?.matchId;
    
    const [match, setMatch] = useState<SearchMatchResult | null>(null);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [otherMatches, setOtherMatches] = useState<VenueMatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [activeFilter, setActiveFilter] = useState("Tout");

    const FILTERS = ["Tout", "À proximité", "< 1 km", "< 5 km", "Ambiance animée", "Avec réservation"];

    // Filter venues based on selected chip
    const filteredVenues = useMemo(() => {
        if (activeFilter === "Tout") return venues;

        return venues.filter(venue => {
            const distanceValue = venue.distance ? parseFloat(venue.distance.replace(/[^\d.]/g, '')) : 999;

            if (activeFilter === "À proximité") return distanceValue < 2;
            if (activeFilter === "< 1 km") return distanceValue < 1;
            if (activeFilter === "< 5 km") return distanceValue < 5;
            if (activeFilter === "Ambiance animée") {
                return (venue.averageAtmosphere && venue.averageAtmosphere > 4) || 
                       venue.tags.some(t => t.toLowerCase().includes("animé") || t.toLowerCase().includes("ambiance"));
            }
            if (activeFilter === "Avec réservation") return venue.isOpen;
            
            return true;
        });
    }, [venues, activeFilter]);

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
            
            // Fetch match details
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

            // Fetch venues broadcasting this specific match
            const venueData = await mobileApi.fetchMatchVenues(
                matchId,
                userLocation?.lat,
                userLocation?.lng,
                50000
            );
            setVenues(venueData);

            // Fetch other matches for the same date
            if (matchData.dateIso) {
                const otherMatchesData = await mobileApi.fetchMatchesForDate(matchData.dateIso);
                // Filter out the current match
                const filteredOthers = otherMatchesData.filter(m => m.id !== matchId);
                setOtherMatches(filteredOthers);
            }

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

    const handleShare = () => {
        if (match && matchId) {
            sharing.shareMatch(match.home.name, match.away.name, matchId);
            posthog.capture("match_shared", {
                match_id: match.id,
                home_team: match.home.name,
                away_team: match.away.name,
            });
        }
    };

    const navigateToOtherMatch = (id: string) => {
        navigation.push("MatchDetailScreen", { matchId: id });
    };

    const renderState = (message: string, showRetry = false) => (
        <View style={styles.stateWrapper}>
            {showRetry ? (
                <>
                    <Text style={[styles.stateText, { color: colors.textMuted }]}>{message}</Text>
                    <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={loadData} activeOpacity={0.85}>
                        <MaterialIcons name="refresh" size={18} color="#fff" />
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
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
                 <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                        <MaterialIcons name="chevron-left" size={28} color={colors.text} />
                    </TouchableOpacity>
                </View>
                <MatchDetailSkeleton />
            </SafeAreaView>
        );
    }

    if (error || !match) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: "center" }]}>
                <View style={[styles.header, { position: 'absolute', top: insets.top, width: '100%', zIndex: 10 }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                        <MaterialIcons name="chevron-left" size={28} color={colors.text} />
                    </TouchableOpacity>
                </View>
                {renderState(error ?? "Match introuvable", true)}
            </SafeAreaView>
        );
    }

    const isUpcoming = match.statusLabel.toLowerCase().includes("à venir") || match.statusLabel.toLowerCase().includes("en cours");

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={themeMode === 'light' ? 'dark-content' : 'light-content'} />
            
            {/* Custom Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <MaterialIcons name="chevron-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Détails du match</Text>
                <TouchableOpacity onPress={handleShare} style={styles.headerBtn}>
                    <MaterialIcons name="ios-share" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView 
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* 1. MATCH SUMMARY CARD */}
                <View style={[styles.matchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.matchCardTop}>
                        <View style={[styles.leaguePill, { backgroundColor: 'rgba(150, 219, 31, 0.15)' }]}>
                            <Text style={[styles.leaguePillText, { color: colors.primary }]}>{match.league}</Text>
                        </View>
                        <View style={[
                            styles.statusPill, 
                            { backgroundColor: isUpcoming ? 'rgba(150, 219, 31, 0.15)' : 'rgba(255, 255, 255, 0.1)' }
                        ]}>
                            <Text style={[
                                styles.statusPillText, 
                                { color: isUpcoming ? colors.primary : colors.textMuted }
                            ]}>
                                {match.statusLabel}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.teamsVsContainer}>
                        <View style={styles.teamSide}>
                            <View style={[styles.logoContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                                {match.home.logo ? (
                                    <Image source={{ uri: match.home.logo }} style={styles.teamLogo} contentFit="contain" />
                                ) : (
                                    <MaterialIcons name="shield" size={24} color={colors.textMuted} />
                                )}
                            </View>
                            <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={2}>{match.home.name}</Text>
                        </View>
                        
                        <View style={styles.vsCenter}>
                            <Text style={[styles.timeText, { color: colors.text }]}>{match.kickoffTime}</Text>
                            <Text style={[styles.dateText, { color: colors.textMuted }]}>{match.timeLabel}</Text>
                        </View>

                        <View style={styles.teamSide}>
                            <View style={[styles.logoContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                                {match.away.logo ? (
                                    <Image source={{ uri: match.away.logo }} style={styles.teamLogo} contentFit="contain" />
                                ) : (
                                    <MaterialIcons name="shield" size={24} color={colors.textMuted} />
                                )}
                            </View>
                            <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={2}>{match.away.name}</Text>
                        </View>
                    </View>

                    {/* Downplayed Stadium Info */}
                    <View style={[styles.stadiumInfo, { borderTopColor: colors.border }]}>
                        <MaterialIcons name="stadium" size={14} color={colors.textMuted} />
                        <Text style={[styles.stadiumText, { color: colors.textMuted }]}>
                            {match.stadium}, {match.city}
                        </Text>
                    </View>
                </View>

                {/* 2. VENUES SECTION */}
                <View style={styles.venuesSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Bars qui diffusent ce match</Text>
                    
                    {/* Filters Row */}
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filtersContainer}
                    >
                        {FILTERS.map((filter) => {
                            const isActive = filter === activeFilter;
                            return (
                                <TouchableOpacity 
                                    key={filter} 
                                    style={[
                                        styles.filterChip, 
                                        { 
                                            backgroundColor: isActive ? colors.primary : colors.surface,
                                            borderColor: isActive ? colors.primary : colors.border
                                        }
                                    ]}
                                    onPress={() => setActiveFilter(filter)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.filterText, 
                                        { color: isActive ? '#000' : colors.text }
                                    ]}>{filter}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </ScrollView>

                    {/* Venues List */}
                    <View style={styles.venuesList}>
                        {filteredVenues.length > 0 ? (
                            filteredVenues.map((venue) => (
                                <TouchableOpacity 
                                    key={venue.id} 
                                    style={[styles.venueListItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                    activeOpacity={0.8}
                                    onPress={() => navigation.navigate("ReservationsScreen", {
                                        venue,
                                        matchId: match.id,
                                        match,
                                        matchDateIso: match.dateIso,
                                    })}
                                >
                                    <View style={styles.venueListImageContainer}>
                                        <Image source={{ uri: venue.image }} style={styles.venueListImage} />
                                        <View style={[styles.broadcastBadge, { backgroundColor: colors.primary }]}>
                                            <MaterialIcons name="live-tv" size={10} color="#000" />
                                            <Text style={styles.broadcastBadgeText}>DIFFUSE LE MATCH</Text>
                                        </View>
                                    </View>
                                    <View style={styles.venueListContent}>
                                        <View style={styles.venueListHeader}>
                                            <Text style={[styles.venueListName, { color: colors.text }]} numberOfLines={1}>{venue.name}</Text>
                                            <View style={[styles.venueListDistance, { backgroundColor: 'rgba(150, 219, 31, 0.15)' }]}>
                                                <MaterialIcons name="place" size={12} color={colors.primary} />
                                                <Text style={[styles.venueListDistanceText, { color: colors.primary }]}>{venue.distance}</Text>
                                            </View>
                                        </View>
                                        
                                        <View style={styles.venueListMeta}>
                                            <View style={styles.metaItem}>
                                                <MaterialIcons name="star" size={14} color={colors.primary} />
                                                <Text style={[styles.metaText, { color: colors.text, fontWeight: '600' }]}>
                                                    {typeof venue.rating === 'number' ? venue.rating.toFixed(1) : Number(venue.rating || 0).toFixed(1)}
                                                </Text>
                                            </View>
                                            <Text style={[styles.metaDot, { color: colors.textMuted }]}>•</Text>
                                            <Text style={[styles.metaText, { color: colors.textMuted }]}>{venue.priceLevel}</Text>
                                            <Text style={[styles.metaDot, { color: colors.textMuted }]}>•</Text>
                                            <Text style={[styles.metaText, { color: colors.textMuted }]} numberOfLines={1}>
                                                {venue.tags[0]}
                                            </Text>
                                        </View>

                                        <View style={styles.screensInfo}>
                                            <MaterialIcons name="tv" size={14} color={colors.primary} />
                                            <Text style={[styles.screensText, { color: colors.textSecondary }]}>
                                                {venue.availableCapacity && venue.totalCapacity 
                                                    ? `Diffuse ce match (${venue.availableCapacity}/${venue.totalCapacity} places dispos)`
                                                    : "Diffuse ce match sur écrans géants"}
                                            </Text>
                                        </View>

                                        <View style={[styles.venueListBtn, { backgroundColor: colors.surfaceAlt }]}>
                                            <Text style={[styles.venueListBtnText, { color: colors.text }]}>Réserver une table</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <View style={[styles.emptyIconCircle, { backgroundColor: colors.background }]}>
                                    <MaterialIcons name="sports-bar" size={32} color={colors.textMuted} />
                                </View>
                                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                                    {venues.length === 0 ? "Aucun bar ne diffuse encore ce match." : "Aucun bar ne correspond à vos filtres."}
                                </Text>
                                <Text style={[styles.emptySub, { color: colors.textMuted }]}>
                                    {venues.length === 0 
                                        ? "Les établissements mettent à jour leur programme au fil de la semaine."
                                        : "Essayez de modifier vos filtres pour voir plus de résultats."}
                                </Text>
                                <TouchableOpacity 
                                    style={[styles.emptyBtn, { borderColor: colors.primary }]}
                                    onPress={() => setActiveFilter("Tout")}
                                >
                                    <Text style={[styles.emptyBtnText, { color: colors.primary }]}>
                                        {venues.length === 0 ? "Voir les bars populaires à proximité" : "Réinitialiser les filtres"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                {/* 3. OTHER MATCHES SECTION */}
                {otherMatches.length > 0 && (
                    <View style={styles.otherMatchesSection}>
                        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>Autres matchs ce jour-là</Text>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.otherMatchesScroll}
                        >
                            {otherMatches.map((m) => (
                                <TouchableOpacity 
                                    key={m.id} 
                                    style={[styles.miniMatchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                    activeOpacity={0.8}
                                    onPress={() => navigateToOtherMatch(m.id)}
                                >
                                    <Text style={[styles.miniMatchLeague, { color: colors.textMuted }]} numberOfLines={1}>{m.league}</Text>
                                    <View style={styles.miniMatchTeams}>
                                        <View style={styles.miniTeamRow}>
                                            {m.team1Logo ? (
                                                <Image source={{ uri: m.team1Logo }} style={styles.miniLogo} />
                                            ) : (
                                                <MaterialIcons name="shield" size={16} color={colors.textMuted} />
                                            )}
                                            <Text style={[styles.miniTeamName, { color: colors.text }]} numberOfLines={1}>{m.team1}</Text>
                                        </View>
                                        <View style={styles.miniTeamRow}>
                                            {m.team2Logo ? (
                                                <Image source={{ uri: m.team2Logo }} style={styles.miniLogo} />
                                            ) : (
                                                <MaterialIcons name="shield" size={16} color={colors.textMuted} />
                                            )}
                                            <Text style={[styles.miniTeamName, { color: colors.text }]} numberOfLines={1}>{m.team2}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.miniMatchTime, { backgroundColor: colors.background }]}>
                                        <Text style={[styles.miniMatchTimeText, { color: colors.text }]}>{m.time}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </ScrollView>

            {/* 4. STICKY BOTTOM BAR */}
            <View style={[
                styles.stickyBottomBar, 
                { 
                    backgroundColor: colors.surface, 
                    borderTopColor: colors.border,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 20 
                }
            ]}>
                <View style={styles.stickyContent}>
                    <View>
                        <Text style={[styles.stickyCount, { color: colors.text }]}>{filteredVenues.length} bars</Text>
                        <Text style={[styles.stickySub, { color: colors.textMuted }]}>près de toi</Text>
                    </View>
                    <TouchableOpacity style={[styles.stickyBtn, { backgroundColor: colors.primary }]}>
                        <MaterialIcons name="map" size={18} color="#000" />
                        <Text style={[styles.stickyBtnText, { color: '#000' }]}>Voir sur la carte</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    headerBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    scrollContent: {
        padding: 16,
        gap: 24,
    },
    matchCard: {
        borderRadius: 24,
        borderWidth: 1,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 5,
    },
    matchCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    leaguePill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    leaguePillText: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    statusPill: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusPillText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    teamsVsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    teamSide: {
        flex: 1,
        alignItems: 'center',
        gap: 12,
    },
    logoContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    teamLogo: {
        width: '100%',
        height: '100%',
    },
    teamName: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
    },
    vsCenter: {
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    timeText: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 12,
        fontWeight: '500',
    },
    stadiumInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingTop: 16,
        borderTopWidth: 1,
    },
    stadiumText: {
        fontSize: 12,
        fontWeight: '500',
    },
    venuesSection: {
        gap: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: 0.2,
    },
    filtersContainer: {
        gap: 8,
        paddingBottom: 4,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
    },
    venuesList: {
        gap: 12,
        marginTop: 4,
    },
    venueListItem: {
        flexDirection: 'row',
        borderRadius: 20,
        borderWidth: 1,
        padding: 12,
        gap: 16,
    },
    venueListImageContainer: {
        position: 'relative',
    },
    venueListImage: {
        width: 100,
        height: 120,
        borderRadius: 12,
        backgroundColor: '#2A2A30',
    },
    broadcastBadge: {
        position: 'absolute',
        bottom: 8,
        left: 4,
        right: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        paddingHorizontal: 4,
        borderRadius: 6,
        gap: 4,
    },
    broadcastBadgeText: {
        fontSize: 8,
        fontWeight: '900',
        color: '#000',
    },
    venueListContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    venueListHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8,
    },
    venueListName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
    },
    venueListDistance: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 2,
    },
    venueListDistanceText: {
        fontSize: 10,
        fontWeight: '800',
    },
    venueListMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    metaText: {
        fontSize: 12,
    },
    metaDot: {
        fontSize: 12,
    },
    screensInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    screensText: {
        fontSize: 11,
    },
    venueListBtn: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 4,
    },
    venueListBtnText: {
        fontSize: 12,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        padding: 32,
        borderRadius: 24,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    emptyIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySub: {
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    emptyBtn: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    emptyBtnText: {
        fontSize: 13,
        fontWeight: '700',
    },
    otherMatchesSection: {
        marginTop: 8,
    },
    otherMatchesScroll: {
        gap: 12,
    },
    miniMatchCard: {
        width: 200,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    miniMatchLeague: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    miniMatchTeams: {
        gap: 8,
        marginBottom: 16,
    },
    miniTeamRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    miniLogo: {
        width: 20,
        height: 20,
    },
    miniTeamName: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    miniMatchTime: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    miniMatchTimeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    stickyBottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 1,
        paddingTop: 16,
        paddingHorizontal: 20,
    },
    stickyContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stickyCount: {
        fontSize: 16,
        fontWeight: '800',
    },
    stickySub: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
    stickyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    stickyBtnText: {
        fontSize: 14,
        fontWeight: '800',
    }
});

export default MatchDetailScreen;
