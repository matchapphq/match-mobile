import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Animated,
    ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { testApi, SearchMatchResult, SearchResult, SearchTrend } from "../services/testApi";
import { useStore } from "../store/useStore";

const TestSearchMenu = ({ navigation }: { navigation: any }) => {
    const { colors, themeMode } = useStore();
    const [searchQuery, setSearchQuery] = useState("");
    const filterAnim = useRef(new Animated.Value(0)).current;
    const activeContentAnim = useRef(new Animated.Value(0)).current;
    const [trends, setTrends] = useState<SearchTrend[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [matchResults, setMatchResults] = useState<SearchMatchResult[]>([]);
    const [venueResults, setVenueResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAllMatches, setShowAllMatches] = useState(false);

    const hasQuery = searchQuery.trim().length > 0;
    const filterWidth = filterAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 44],
    });
    const filterMarginLeft = filterAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 6],
    });
    const searchScale = filterAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.94],
    });

    useEffect(() => {
        Animated.spring(filterAnim, {
            toValue: hasQuery ? 1 : 0,
            useNativeDriver: false,
            friction: 8,
        }).start();
        Animated.timing(activeContentAnim, {
            toValue: hasQuery ? 1 : 0,
            duration: 220,
            useNativeDriver: true,
        }).start();
    }, [hasQuery, filterAnim, activeContentAnim]);

    const clearQuery = () => setSearchQuery("");
    const loadSearchData = useCallback(async () => {
        try {
            setError(null);
            setIsLoading(true);
            const data = await testApi.fetchSearchData();
            setTrends(data.trends);
            setRecentSearches(data.recentSearches);
            setMatchResults(data.matchResults);
            setVenueResults(data.results);
        } catch (err) {
            console.warn("Failed to load search data", err);
            setError("Impossible de charger les données de recherche.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSearchData();
    }, [loadSearchData]);

    const recentItems = React.useMemo(
        () =>
            recentSearches.map((entry, index) => ({
                id: `${entry}-${index}`,
                title: entry,
                subtitle: "Recherche récente",
            })),
        [recentSearches]
    );

    const renderState = (message: string, showRetry = false) => (
        <View style={styles.stateWrapper}>
            {showRetry ? (
                <>
                    <Text style={[styles.stateText, { color: colors.textMuted }]}>{message}</Text>
                    <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={loadSearchData} activeOpacity={0.85}>
                        <MaterialIcons name="refresh" size={18} color={colors.white} />
                        <Text style={[styles.retryButtonText, { color: colors.white }]}>Réessayer</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <ActivityIndicator color={colors.primary} />
                    <Text style={[styles.stateText, { color: colors.textMuted, marginTop: 12 }]}>{message}</Text>
                </>
            )}
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
            <StatusBar barStyle={themeMode === 'light' ? 'dark-content' : 'light-content'} />

            <View style={[styles.header, { backgroundColor: themeMode === 'light' ? 'rgba(248,247,245,0.95)' : 'rgba(8,8,10,0.95)', borderBottomColor: colors.divider }]}>
                <View style={styles.searchRow}>
                    <TouchableOpacity
                        style={[styles.iconPill, { backgroundColor: colors.surface }]}
                        onPress={() => navigation.goBack?.()}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons name="arrow-back" size={20} color={colors.text} />
                    </TouchableOpacity>

                    <Animated.View style={[styles.searchAnimatedWrap, { transform: [{ scaleX: searchScale }] }]}>
                        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
                            <MaterialIcons name="search" size={20} color={colors.textMuted} />
                            <TextInput
                                style={[styles.searchInput, { color: colors.text }]}
                                placeholder="Rechercher un match, un bar..."
                                placeholderTextColor={colors.textMuted}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                selectionColor={colors.primary}
                            />
                            {hasQuery && (
                                <TouchableOpacity onPress={clearQuery} activeOpacity={0.7}>
                                    <MaterialIcons name="close" size={20} color={colors.textMuted} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </Animated.View>

                    <Animated.View
                        style={[
                            styles.iconPill,
                            // styles.filterButton, // Removing filterButton style to avoid conflict or just style inline
                            {
                                width: filterWidth,
                                marginLeft: filterMarginLeft,
                                opacity: filterAnim,
                                backgroundColor: colors.surfaceAlt, // Dynamic background
                                transform: [
                                    {
                                        translateX: filterAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [20, 0],
                                        }),
                                    },
                                    {
                                        scale: filterAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.8, 1],
                                        }),
                                    },
                                ],
                                shadowColor: "#000",
                                shadowOpacity: 0.4,
                                shadowRadius: 6,
                                shadowOffset: { width: 0, height: 4 },
                                elevation: 8,
                            },
                        ]}
                        pointerEvents={hasQuery ? "auto" : "none"}
                    >
                        <MaterialIcons name="tune" size={20} color={colors.text} />
                    </Animated.View>
                </View>
            </View>

            {isLoading
                ? renderState("Chargement des suggestions…")
                : error
                    ? renderState(error, true)
                    : (
                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                        >
                            {hasQuery ? (
                                <Animated.View
                                    style={{
                                        opacity: activeContentAnim,
                                        transform: [
                                            {
                                                translateY: activeContentAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [16, 0],
                                                }),
                                            },
                                        ],
                                    }}
                                >
                                    <View style={styles.sectionHeaderRow}>
                                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Matchs</Text>
                                        {matchResults.length > 3 && (
                                            <TouchableOpacity onPress={() => setShowAllMatches((prev) => !prev)}>
                                                <Text style={styles.sectionAction}>
                                                    {showAllMatches ? "Voir moins" : "Voir tout"}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    {matchResults.length > 0 ? (
                                        matchResults
                                            .slice(0, showAllMatches ? undefined : 3)
                                            .map((match) => (
                                                <TouchableOpacity
                                                    key={match.id}
                                                    style={[styles.matchCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.divider }]}
                                                    activeOpacity={0.9}
                                                    onPress={() => navigation.navigate("TestMatchDetail", { matchId: match.id })}
                                                >
                                                    <View style={[styles.matchCardBackdrop, { backgroundColor: "rgba(244,123,37,0.1)" }]} />
                                                    <View style={styles.matchMeta}>
                                                        <Text style={[styles.leagueChip, { color: colors.textMuted, backgroundColor: colors.surface }]}>{match.league}</Text>
                                                        <View style={styles.matchTime}>
                                                            <MaterialIcons
                                                                name="schedule"
                                                                size={16}
                                                                color={colors.primary}
                                                                style={{ marginRight: 4 }}
                                                            />
                                                            <Text style={[styles.matchTimeText, { color: colors.primary }]}>{match.timeLabel}</Text>
                                                        </View>
                                                    </View>

                                                    <View style={styles.teamsRow}>
                                                        <View style={styles.teamColumn}>
                                                            <View style={[styles.teamBadge, { backgroundColor: match.home.color, borderColor: colors.white }]}>
                                                                <Text style={[styles.teamBadgeText, { color: colors.text }]}>{match.home.badge}</Text>
                                                            </View>
                                                            <Text style={[styles.teamName, { color: colors.text }]}>{match.home.name}</Text>
                                                        </View>
                                                        <View style={styles.vsColumn}>
                                                            <Text style={[styles.vsLabel, { color: colors.textMuted }]}>VS</Text>
                                                        </View>
                                                        <View style={styles.teamColumn}>
                                                            <View style={[styles.teamBadge, { backgroundColor: match.away.color, borderColor: colors.white }]}>
                                                                <Text style={[styles.teamBadgeText, { color: colors.text }]}>{match.away.badge}</Text>
                                                            </View>
                                                            <Text style={[styles.teamName, { color: colors.text }]}>{match.away.name}</Text>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            ))
                                    ) : (
                                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>Aucun match trouvé.</Text>
                                    )}

                                    <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
                                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Lieux</Text>
                                    </View>

                                    <View style={{ gap: 12 }}>
                                        {venueResults.length > 0 ? (
                                            venueResults.map((venue) => (
                                                <TouchableOpacity key={venue.id} style={[styles.venueRow, { backgroundColor: colors.surface, borderColor: colors.divider }]} activeOpacity={0.85}>
                                                    <View style={[styles.venueThumbnail, { backgroundColor: colors.surfaceAlt }]}>
                                                        <MaterialIcons
                                                            name={(venue.isLive ? "sports-bar" : "location-on") as any}
                                                            size={34}
                                                            color={colors.textMuted} // Was rgba white 0.5
                                                        />
                                                        <View style={[styles.ratingBadge, { backgroundColor: colors.text }]}>
                                                            <MaterialIcons
                                                                name="star"
                                                                size={12}
                                                                color="#fbbf24"
                                                                style={{ marginRight: 2 }}
                                                            />
                                                            <Text style={[styles.ratingText, { color: '#000' }]}>{venue.rating.toFixed(1)}</Text>
                                                        </View>
                                                    </View>

                                                    <View style={styles.venueInfo}>
                                                        <View style={styles.venueTitleRow}>
                                                            <Text style={[styles.venueName, { color: colors.text }]} numberOfLines={1}>
                                                                {venue.name}
                                                            </Text>
                                                            <Text style={[styles.venueBadge, { color: colors.text }]}>
                                                                {venue.isLive ? "Ouvert" : "Fermé"}
                                                            </Text>
                                                        </View>
                                                        <Text style={[styles.venueTags, { color: colors.textMuted }]}>{venue.tag}</Text>
                                                        <View style={styles.venueMetaRow}>
                                                            <View style={styles.venueMetaItem}>
                                                                <MaterialIcons name="location-on" size={14} color={colors.textMuted} />
                                                                <Text style={[styles.venueMetaText, { color: colors.textMuted }]}>{venue.distance}</Text>
                                                            </View>
                                                            <View style={styles.venueMetaItem}>
                                                                <MaterialIcons name="euro" size={14} color={colors.textMuted} />
                                                                <Text style={[styles.venueMetaText, { color: colors.textMuted }]}>{venue.priceLevel ?? "€€"}</Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            ))
                                        ) : (
                                            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Aucun bar disponible.</Text>
                                        )}
                                    </View>
                                </Animated.View>
                            ) : (
                                <View>
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Tendances</Text>
                                    <View style={styles.trendsWrap}>
                                        {trends.length > 0 ? (
                                            trends.map((trend) => (
                                                <TouchableOpacity key={trend.label} style={[styles.trendChip, { backgroundColor: colors.surfaceAlt, borderColor: colors.divider }]}>
                                                    <MaterialIcons name={trend.icon as any} size={18} color={colors.primary} />
                                                    <Text style={[styles.trendChipText, { color: colors.text }]}>{trend.label}</Text>
                                                </TouchableOpacity>
                                            ))
                                        ) : (
                                            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Aucune tendance disponible.</Text>
                                        )}
                                    </View>

                                    <View style={{ marginTop: 28 }}>
                                        <View style={styles.sectionHeaderRow}>
                                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Historique</Text>
                                            <TouchableOpacity>
                                                <Text style={styles.sectionAction}>Tout effacer</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {recentItems.length > 0 ? (
                                            <View style={[styles.historyList, { borderColor: colors.divider, backgroundColor: colors.surface }]}>
                                                {recentItems.map((item) => (
                                                    <View key={item.id} style={[styles.historyItem, { borderBottomColor: colors.divider }]}>
                                                        <View style={styles.historyLeft}>
                                                            <View style={[styles.historyIcon, { backgroundColor: colors.surfaceAlt }]}>
                                                                <MaterialIcons name="history" size={20} color={colors.textMuted} />
                                                            </View>
                                                            <View style={{ flex: 1 }}>
                                                                <Text style={[styles.historyTitle, { color: colors.text }]}>{item.title}</Text>
                                                                <Text style={[styles.historySubtitle, { color: colors.textMuted }]}>{item.subtitle}</Text>
                                                            </View>
                                                        </View>
                                                        <TouchableOpacity activeOpacity={0.6}>
                                                            <MaterialIcons name="close" size={20} color={colors.textMuted} />
                                                        </TouchableOpacity>
                                                    </View>
                                                ))}
                                            </View>
                                        ) : (
                                            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Aucune recherche récente.</Text>
                                        )}
                                    </View>
                                </View>
                            )}
                        </ScrollView>
                    )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 18,
        // backgroundColor: "rgba(8,8,10,0.95)", // Removed hardcoded color
        borderBottomWidth: StyleSheet.hairlineWidth,
        // borderBottomColor: COLORS.divider, // Removed hardcoded color
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    iconPill: {
        width: 44,
        height: 44,
        borderRadius: 12,
        // backgroundColor: COLORS.surface, // Removed hardcoded color
        alignItems: "center",
        justifyContent: "center",
    },
    searchAnimatedWrap: {
        flex: 1,
    },
    searchContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        paddingHorizontal: 12,
        height: 48,
    },
    filterButton: {
        // backgroundColor: COLORS.surfaceAlt, // Removed hardcoded color. Note: Inline style will override if needed, but safer to rely on dynamic color in JSX
        shadowColor: "#000",
        shadowOpacity: 0.4,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },
    searchInput: {
        flex: 1,
        // color: COLORS.text, // Removed hardcoded color
        fontSize: 16,
        fontWeight: "500",
        paddingVertical: 0,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 120,
    },
    sectionHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    sectionTitle: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: "700",
    },
    sectionAction: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    matchCard: {
        backgroundColor: COLORS.surfaceAlt,
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.divider,
        overflow: "hidden",
    },
    matchCardBackdrop: {
        position: "absolute",
        top: -30,
        right: -30,
        width: 140,
        height: 140,
        backgroundColor: "rgba(244,123,37,0.1)",
        borderRadius: 70,
    },
    matchMeta: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 18,
    },
    leagueChip: {
        color: COLORS.textMuted,
        fontSize: 12,
        backgroundColor: "rgba(255,255,255,0.05)",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    matchTime: {
        flexDirection: "row",
        alignItems: "center",
    },
    matchTimeText: {
        color: COLORS.primary,
        fontWeight: "600",
        fontSize: 12,
    },
    teamsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    teamColumn: {
        flex: 1,
        alignItems: "center",
        gap: 8,
    },
    teamBadge: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 3,
        borderColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 4,
    },
    teamBadgeText: {
        color: COLORS.text,
        fontWeight: "800",
        letterSpacing: 1,
    },
    teamName: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: "600",
    },
    vsColumn: {
        paddingHorizontal: 18,
    },
    vsLabel: {
        color: "rgba(255,255,255,0.4)",
        fontSize: 24,
        fontWeight: "900",
        letterSpacing: 2,
    },
    venueRow: {
        flexDirection: "row",
        gap: 14,
        padding: 14,
        borderRadius: 20,
        // backgroundColor: COLORS.surface, // Removed hardcoded color
        borderWidth: 1,
        // borderColor: COLORS.divider, // Removed hardcoded color
    },
    venueThumbnail: {
        width: 72,
        height: 72,
        borderRadius: 18,
        // backgroundColor: COLORS.surfaceAlt, // Removed hardcoded color
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    ratingBadge: {
        position: "absolute",
        top: 6,
        right: 6,
        backgroundColor: COLORS.text,
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        flexDirection: "row",
        alignItems: "center",
    },
    ratingText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#111",
    },
    venueInfo: {
        flex: 1,
        minWidth: 0,
    },
    venueTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    venueName: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: "700",
        flex: 1,
    },
    venueBadge: {
        color: COLORS.text,
        fontSize: 11,
        fontWeight: "700",
        backgroundColor: "rgba(244,123,37,0.15)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    venueTags: {
        color: COLORS.textMuted,
        fontSize: 12,
        marginTop: 4,
    },
    venueMetaRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 10,
    },
    venueMetaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    venueMetaText: {
        color: COLORS.textMuted,
        fontSize: 12,
    },
    trendsWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 12,
    },
    trendChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        // backgroundColor: COLORS.surfaceAlt, // Removed hardcoded color
        borderWidth: 1,
        // borderColor: COLORS.divider, // Removed hardcoded color
    },
    trendChipText: {
        color: COLORS.text,
        fontSize: 13,
        fontWeight: "600",
    },
    historyList: {
        marginTop: 10,
        borderRadius: 20,
        borderWidth: 1,
        // borderColor: COLORS.divider, // Removed hardcoded color
        // backgroundColor: COLORS.surface, // Removed hardcoded color
    },
    historyItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        // borderBottomColor: COLORS.divider, // Removed hardcoded color
    },
    historyLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    historyIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        // backgroundColor: COLORS.surfaceAlt, // Removed hardcoded color
        alignItems: "center",
        justifyContent: "center",
    },
    historyTitle: {
        color: COLORS.text,
        fontWeight: "600",
    },
    historySubtitle: {
        color: COLORS.textMuted,
        fontSize: 12,
        marginTop: 2,
    },
    stateWrapper: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    stateText: {
        color: COLORS.textMuted,
        fontSize: 14,
        textAlign: "center",
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
        color: COLORS.white,
        fontWeight: "700",
    },
    emptyText: {
        color: COLORS.textMuted,
        fontSize: 13,
        marginTop: 8,
    },
});

export default TestSearchMenu;
