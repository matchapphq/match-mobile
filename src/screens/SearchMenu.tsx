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
    Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { mobileApi, SearchMatchResult, SearchResult, SearchTrend } from "../services/mobileApi";
import { useStore } from "../store/useStore";
import { usePostHog } from "posthog-react-native";

type TabFilter = "all" | "matches" | "venues";

const SearchMenu = ({ navigation }: { navigation: any }) => {
    const { colors, themeMode } = useStore();
    const posthog = usePostHog();
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
    const [activeTab, setActiveTab] = useState<TabFilter>("all");
    const [selectedDateIndex, setSelectedDateIndex] = useState(1); // Default to second date (like "Mer 04")
    const [selectedVenueFilter, setSelectedVenueFilter] = useState<"nearby" | "top_rated" | "open_now">("nearby");
    
    // Debounced search state
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    
    // Pagination state
    const [matchPage, setMatchPage] = useState(1);
    const [venuePage, setVenuePage] = useState(1);
    const [hasMoreMatches, setHasMoreMatches] = useState(true);
    const [hasMoreVenues, setHasMoreVenues] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const PAGE_SIZE = 15;

    const venueFilters = [
        { key: "nearby" as const, label: "Le plus proche" },
        { key: "top_rated" as const, label: "Mieux notés" },
        { key: "open_now" as const, label: "Ouvert maintenant" },
    ];

    // Generate date pills for the next 7 days using local timezone
    const datePills = React.useMemo(() => {
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const today = new Date();
        // Reset to start of day in local timezone to avoid time-based shifts
        today.setHours(0, 0, 0, 0);
        
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            // Format as YYYY-MM-DD using local timezone (not UTC)
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const fullDate = `${year}-${month}-${day}`;
            
            return {
                day: days[date.getDay()],
                date: day,
                fullDate, // YYYY-MM-DD in local timezone
            };
        });
    }, []);

    // Get the selected date for filtering (only when on matches tab)
    const selectedFilterDate = activeTab === "matches" ? datePills[selectedDateIndex]?.fullDate : undefined;

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

    const clearQuery = () => {
        setSearchQuery("");
        setDebouncedQuery("");
    };

    // Debounce search query (300ms)
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            setDebouncedQuery(searchQuery);
            // Reset pagination when query changes
            setMatchPage(1);
            setVenuePage(1);
            setHasMoreMatches(true);
            setHasMoreVenues(true);
        }, 300);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [searchQuery]);

    // Reset pagination when tab or selected date changes
    useEffect(() => {
        setMatchPage(1);
        setVenuePage(1);
        setHasMoreMatches(true);
        setHasMoreVenues(true);
    }, [activeTab, selectedDateIndex]);

    // Fetch search results based on debounced query and active tab
    const fetchSearchResults = useCallback(async (page: number = 1, append: boolean = false) => {
        try {
            if (!append) {
                setError(null);
                setIsLoading(true);
            } else {
                setIsLoadingMore(true);
            }

            const data = await mobileApi.searchPaginated(debouncedQuery, activeTab, page, PAGE_SIZE, selectedFilterDate);

            if (!append && debouncedQuery.trim().length > 0) {
                posthog.capture("venue_searched", {
                    query: debouncedQuery,
                    tab: activeTab,
                    selected_date: selectedFilterDate,
                });
            }

            if (append) {
                if (activeTab === "matches" || activeTab === "all") {
                    setMatchResults(prev => [...prev, ...data.matches]);
                }
                if (activeTab === "venues" || activeTab === "all") {
                    setVenueResults(prev => [...prev, ...data.venues]);
                }
            } else {
                setMatchResults(data.matches);
                setVenueResults(data.venues);
            }

            setHasMoreMatches(data.hasMoreMatches);
            setHasMoreVenues(data.hasMoreVenues);

            // Load trends for initial load
            if (page === 1 && !append) {
                const initialData = await mobileApi.fetchSearchData();
                setTrends(initialData.trends);
                setRecentSearches(initialData.recentSearches);
            }
        } catch (err) {
            console.warn("Failed to load search data", err);
            setError("Impossible de charger les données de recherche.");
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [debouncedQuery, activeTab, selectedFilterDate]);

    // Initial load and when debounced query or tab changes
    useEffect(() => {
        fetchSearchResults(1, false);
    }, [fetchSearchResults]);

    // Load more handler for infinite scroll
    const handleLoadMore = useCallback(() => {
        if (isLoadingMore || isLoading) return;

        if (activeTab === "matches" && hasMoreMatches) {
            const nextPage = matchPage + 1;
            setMatchPage(nextPage);
            fetchSearchResults(nextPage, true);
        } else if (activeTab === "venues" && hasMoreVenues) {
            const nextPage = venuePage + 1;
            setVenuePage(nextPage);
            fetchSearchResults(nextPage, true);
        }
    }, [isLoadingMore, isLoading, activeTab, hasMoreMatches, hasMoreVenues, matchPage, venuePage, fetchSearchResults]);

    // Scroll handler for infinite scroll
    const handleScroll = useCallback((event: any) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const paddingToBottom = 100;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
        
        if (isCloseToBottom) {
            handleLoadMore();
        }
    }, [handleLoadMore]);

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
                    <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={() => fetchSearchResults(1, false)} activeOpacity={0.85}>
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
                    <View style={[styles.searchInputContainer, { backgroundColor: colors.surface, borderColor: hasQuery ? colors.primary + '80' : 'transparent' }]}>
                        <TouchableOpacity onPress={() => navigation.goBack?.()} activeOpacity={0.7}>
                            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Rechercher..."
                            placeholderTextColor={colors.textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            selectionColor={colors.primary}
                            autoFocus={false}
                        />
                        {hasQuery && (
                            <TouchableOpacity onPress={clearQuery} activeOpacity={0.7}>
                                <MaterialIcons name="close" size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[styles.filterButton, { backgroundColor: colors.surface }]}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons name="tune" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Tab Filter */}
                <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === "all" && [styles.tabActive, { backgroundColor: colors.background }]]}
                        onPress={() => setActiveTab("all")}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, { color: activeTab === "all" ? colors.text : colors.textMuted }, activeTab === "all" && styles.tabTextActive]}>
                            Tous
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === "matches" && [styles.tabActive, { backgroundColor: colors.background }]]}
                        onPress={() => setActiveTab("matches")}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, { color: activeTab === "matches" ? colors.text : colors.textMuted }, activeTab === "matches" && styles.tabTextActive]}>
                            Matchs
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === "venues" && [styles.tabActive, { backgroundColor: colors.background }]]}
                        onPress={() => setActiveTab("venues")}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, { color: activeTab === "venues" ? colors.text : colors.textMuted }, activeTab === "venues" && styles.tabTextActive]}>
                            Lieux
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Date Picker Pills - Only show when Matchs tab is active */}
                {activeTab === "matches" && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.datePickerContainer}
                        style={styles.datePickerScroll}
                    >
                        {datePills.map((pill, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.datePill,
                                    { 
                                        backgroundColor: selectedDateIndex === index ? colors.primary : (themeMode === 'light' ? '#fff' : colors.surfaceAlt),
                                        borderColor: selectedDateIndex === index ? colors.primary : colors.divider,
                                    }
                                ]}
                                onPress={() => setSelectedDateIndex(index)}
                                activeOpacity={0.8}
                            >
                                <Text style={[
                                    styles.datePillDay,
                                    { color: selectedDateIndex === index ? '#fff' : colors.textMuted }
                                ]}>
                                    {pill.day}
                                </Text>
                                <Text style={[
                                    styles.datePillDate,
                                    { color: selectedDateIndex === index ? '#fff' : colors.textMuted }
                                ]}>
                                    {pill.date}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* Venue Filter Pills - Only show when Lieux tab is active */}
                {activeTab === "venues" && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.venueFilterContainer}
                        style={styles.venueFilterScroll}
                    >
                        {venueFilters.map((filter) => (
                            <TouchableOpacity
                                key={filter.key}
                                style={[
                                    styles.venueFilterPill,
                                    { 
                                        backgroundColor: selectedVenueFilter === filter.key ? colors.primary : (themeMode === 'light' ? '#fff' : colors.surfaceAlt),
                                        borderColor: selectedVenueFilter === filter.key ? colors.primary : colors.divider,
                                    }
                                ]}
                                onPress={() => setSelectedVenueFilter(filter.key)}
                                activeOpacity={0.8}
                            >
                                <Text style={[
                                    styles.venueFilterText,
                                    { color: selectedVenueFilter === filter.key ? '#fff' : colors.textMuted }
                                ]}>
                                    {filter.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
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
                            onScroll={handleScroll}
                            scrollEventThrottle={400}
                        >
                            <View style={{ flex: 1 }}>
                                    {/* Matches Section */}
                                    {(activeTab === "all" || activeTab === "matches") && (
                                        <>
                                            <View style={styles.sectionHeaderRow}>
                                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                                    {activeTab === "matches" ? `${matchResults.length} Matchs trouvés` : "Prochains matchs"}
                                                </Text>
                                                {matchResults.length > 2 && activeTab === "all" && (
                                                    <TouchableOpacity onPress={() => setActiveTab("matches")}>
                                                        <Text style={styles.sectionAction}>Voir tout</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                            {matchResults.length > 0 ? (
                                                <View style={{ gap: 16 }}>
                                                    {matchResults
                                                        .slice(0, activeTab === "all" ? 2 : undefined)
                                                        .map((match) => (
                                                            <TouchableOpacity
                                                                key={match.id}
                                                                style={[styles.matchCard, { backgroundColor: themeMode === 'light' ? '#fff' : colors.surfaceAlt, borderColor: colors.divider }]}
                                                                activeOpacity={0.9}
                                                                onPress={() => navigation.navigate("MatchDetail", { matchId: match.id })}
                                                            >
                                                                <View style={[styles.matchCardBackdrop, { backgroundColor: "rgba(59,130,246,0.1)" }]} />
                                                                
                                                                {/* Header: League + Date */}
                                                                <View style={styles.matchHeader}>
                                                                    <View style={styles.matchLeagueInfo}>
                                                                        <Text style={[styles.leagueName, { color: colors.primary }]}>
                                                                            {match.league}
                                                                        </Text>
                                                                        <Text style={[styles.leagueSubtitle, { color: colors.textMuted }]}>
                                                                            {match.statusLabel || 'Journée 1'}
                                                                        </Text>
                                                                    </View>
                                                                    <View style={[styles.matchDateBadge, { backgroundColor: themeMode === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.05)', borderColor: themeMode === 'light' ? 'transparent' : 'rgba(255,255,255,0.05)' }]}>
                                                                        <MaterialIcons name="event" size={16} color={colors.textMuted} style={{ marginRight: 6 }} />
                                                                        <Text style={[styles.matchDateText, { color: themeMode === 'light' ? '#334155' : '#e2e8f0' }]}>
                                                                            {match.timeLabel}
                                                                        </Text>
                                                                    </View>
                                                                </View>

                                                                {/* Teams Row */}
                                                                <View style={styles.teamsRow}>
                                                                    <View style={styles.teamColumn}>
                                                                        <View style={[styles.teamBadgeLarge, { backgroundColor: match.home.color, borderColor: themeMode === 'light' ? '#f1f5f9' : '#2a2a30' }]}>
                                                                            <Text style={styles.teamBadgeTextLarge}>{match.home.badge}</Text>
                                                                        </View>
                                                                        <Text style={[styles.teamName, { color: colors.text }]}>{match.home.name}</Text>
                                                                    </View>
                                                                    <View style={styles.vsColumnNew}>
                                                                        <Text style={[styles.vsLabel, { color: themeMode === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.1)' }]}>VS</Text>
                                                                        <View style={[styles.broadcastPill, { backgroundColor: 'rgba(244,123,37,0.1)', borderColor: 'rgba(244,123,37,0.2)' }]}>
                                                                            <View style={styles.broadcastDotAnimated} />
                                                                            <Text style={styles.broadcastPillText}>Diffusé</Text>
                                                                        </View>
                                                                    </View>
                                                                    <View style={styles.teamColumn}>
                                                                        <View style={[styles.teamBadgeLarge, { backgroundColor: match.away.color, borderColor: themeMode === 'light' ? '#f1f5f9' : '#2a2a30' }]}>
                                                                            <Text style={styles.teamBadgeTextLarge}>{match.away.badge}</Text>
                                                                        </View>
                                                                        <Text style={[styles.teamName, { color: colors.text }]}>{match.away.name}</Text>
                                                                    </View>
                                                                </View>
                                                            </TouchableOpacity>
                                                        ))}
                                                </View>
                                            ) : (
                                                <Text style={[styles.emptyText, { color: colors.textMuted }]}>Aucun match trouvé.</Text>
                                            )}
                                        </>
                                    )}

                                    {/* Venues Section */}
                                    {(activeTab === "all" || activeTab === "venues") && (
                                        <>
                                            {activeTab === "all" && (
                                                <View style={[styles.sectionHeaderRow, { marginTop: 32 }]}>
                                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Lieux & Bars</Text>
                                                    {venueResults.length > 2 && (
                                                        <TouchableOpacity onPress={() => setActiveTab("venues")}>
                                                            <Text style={styles.sectionAction}>Voir tout</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            )}

                                            <View style={{ gap: 16 }}>
                                                {venueResults.length > 0 ? (
                                                    venueResults
                                                        .slice(0, activeTab === "all" ? 2 : undefined)
                                                        .map((venue) => (
                                                            <TouchableOpacity
                                                                key={venue.id}
                                                                style={[styles.venueCardNew, { backgroundColor: themeMode === 'light' ? '#fff' : colors.surfaceAlt, borderColor: colors.divider }]}
                                                                activeOpacity={0.85}
                                                                onPress={() => navigation.navigate('VenueProfile', { venueId: venue.id })}
                                                            >
                                                                <View style={[styles.venueImageContainerNew, { backgroundColor: colors.surface }]}>
                                                                    {venue.image ? (
                                                                        <Image source={{ uri: venue.image }} style={styles.venueImageNew} />
                                                                    ) : (
                                                                        <MaterialIcons name="sports-bar" size={40} color={colors.textMuted} />
                                                                    )}
                                                                    {venue.isLive && (
                                                                        <View style={styles.venueOpenBadge}>
                                                                            <Text style={styles.venueOpenText}>OUVERT</Text>
                                                                        </View>
                                                                    )}
                                                                </View>

                                                                <View style={styles.venueInfoNew}>
                                                                    <View style={styles.venueTitleRowNew}>
                                                                        <Text style={[styles.venueNameNew, { color: colors.text }]} numberOfLines={1}>
                                                                            {venue.name}
                                                                        </Text>
                                                                        <View style={[styles.venueRatingBadgeNew, { backgroundColor: venue.rating >= 4.5 ? 'rgba(244,123,37,0.1)' : themeMode === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.1)' }]}>
                                                                            <Text style={[styles.venueRatingTextNew, { color: venue.rating >= 4.5 ? colors.primary : colors.text }]}>
                                                                                {venue.rating.toFixed(1)}
                                                                            </Text>
                                                                        </View>
                                                                    </View>
                                                                    <Text style={[styles.venueTagLineNew, { color: colors.textMuted }]}>{venue.tag}</Text>
                                                                    <View style={styles.venueLocationRow}>
                                                                        <MaterialIcons name="location-on" size={12} color={colors.textMuted} />
                                                                        <Text style={[styles.venueLocationText, { color: colors.textMuted }]}>{venue.distance}</Text>
                                                                    </View>
                                                                    <View style={styles.venueAmenitiesNew}>
                                                                        <View style={[styles.amenityChipNew, { backgroundColor: themeMode === 'light' ? '#fff' : 'rgba(255,255,255,0.05)', borderColor: colors.divider }]}>
                                                                            <Text style={[styles.amenityTextNew, { color: colors.textMuted }]}>Billard</Text>
                                                                        </View>
                                                                        <View style={[styles.amenityChipNew, { backgroundColor: themeMode === 'light' ? '#fff' : 'rgba(255,255,255,0.05)', borderColor: colors.divider }]}>
                                                                            <Text style={[styles.amenityTextNew, { color: colors.textMuted }]}>Happy Hour</Text>
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                            </TouchableOpacity>
                                                        ))
                                                ) : (
                                                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>Aucun bar disponible.</Text>
                                                )}
                                            </View>
                                        </>
                                    )}

                                    {/* Loading more indicator */}
                                    {isLoadingMore && (
                                        <View style={styles.loadingMoreContainer}>
                                            <ActivityIndicator color={colors.primary} size="small" />
                                            <Text style={[styles.loadingMoreText, { color: colors.textMuted }]}>
                                                Chargement...
                                            </Text>
                                        </View>
                                    )}

                                    {/* End of results indicator */}
                                    {activeTab === "matches" && !hasMoreMatches && matchResults.length > 0 && (
                                        <Text style={[styles.endOfResultsText, { color: colors.textMuted }]}>
                                            Tous les matchs ont été chargés
                                        </Text>
                                    )}
                                    {activeTab === "venues" && !hasMoreVenues && venueResults.length > 0 && (
                                        <Text style={[styles.endOfResultsText, { color: colors.textMuted }]}>
                                            Tous les lieux ont été chargés
                                        </Text>
                                    )}
                                </View>
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
        gap: 12,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        borderWidth: 1,
    },
    filterButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    tabContainer: {
        flexDirection: "row",
        borderRadius: 12,
        padding: 4,
        marginTop: 12,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    tabActive: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
    },
    tabText: {
        fontSize: 12,
        fontWeight: "500",
    },
    tabTextActive: {
        fontWeight: "700",
    },
    iconPill: {
        width: 44,
        height: 44,
        borderRadius: 12,
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
    datePickerScroll: {
        marginTop: 8,
        marginBottom: 12,
        marginHorizontal: -16,
    },
    datePickerContainer: {
        paddingHorizontal: 16,
        gap: 8,
    },
    datePill: {
        minWidth: 52,
        height: 58,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
    datePillDay: {
        fontSize: 10,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        opacity: 0.7,
    },
    datePillDate: {
        fontSize: 14,
        fontWeight: "600",
    },
    venueFilterScroll: {
        marginTop: 8,
        marginBottom: 12,
        marginHorizontal: -16,
    },
    venueFilterContainer: {
        paddingHorizontal: 16,
        gap: 8,
    },
    venueFilterPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
    },
    venueFilterText: {
        fontSize: 12,
        fontWeight: "600",
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
        top: -40,
        right: -40,
        width: 128,
        height: 128,
        backgroundColor: "rgba(59,130,246,0.1)",
        borderRadius: 64,
    },
    matchHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    matchLeagueInfo: {
        flexDirection: "column",
        gap: 4,
    },
    leagueName: {
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    leagueSubtitle: {
        fontSize: 12,
        fontWeight: "500",
    },
    matchDateBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
    },
    matchDateText: {
        fontSize: 12,
        fontWeight: "600",
    },
    teamBadgeLarge: {
        width: 68,
        height: 68,
        borderRadius: 34,
        borderWidth: 3,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    teamBadgeTextLarge: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 12,
    },
    vsColumnNew: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 16,
        gap: 16,
    },
    broadcastPill: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        gap: 6,
    },
    broadcastDotAnimated: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.primary,
    },
    broadcastPillText: {
        fontSize: 10,
        fontWeight: "700",
        color: COLORS.primary,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    matchMetaBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    matchMetaRight: {
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 2,
    },
    leagueChip: {
        color: COLORS.textMuted,
        fontSize: 10,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    matchTime: {
        flexDirection: "row",
        alignItems: "center",
    },
    matchTimeText: {
        color: COLORS.primary,
        fontWeight: "700",
        fontSize: 11,
    },
    broadcastRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 4,
    },
    teamsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
    },
    teamColumn: {
        flex: 1,
        alignItems: "center",
        gap: 10,
    },
    teamBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 3,
        borderColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    teamBadgeText: {
        color: COLORS.text,
        fontWeight: "700",
        fontSize: 12,
    },
    teamName: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },
    vsColumn: {
        paddingHorizontal: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    vsLabel: {
        fontSize: 20,
        fontWeight: "900",
        fontStyle: "italic",
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
    venueTagLine: {
        color: COLORS.textMuted,
        fontSize: 10,
        marginTop: 2,
        lineHeight: 12,
    },
    venueMetaRow: {
        flexDirection: "row",
        gap: 8,
        marginTop: 6,
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
    matchTimeColumn: {
        alignItems: "flex-end",
        gap: 6,
    },
    broadcastBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(244,123,37,0.1)",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        gap: 3,
    },
    broadcastDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.primary,
    },
    broadcastText: {
        fontSize: 9,
        fontWeight: "700",
        color: COLORS.primary,
        textTransform: "uppercase",
    },
    venueCard: {
        flexDirection: "row",
        gap: 12,
        padding: 10,
        borderRadius: 16,
        borderWidth: 1,
    },
    venueImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 12,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
    },
    venueImage: {
        width: "100%",
        height: "100%",
    },
    venueStatusBadge: {
        position: "absolute",
        top: 4,
        left: 4,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.6)",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 4,
    },
    venueStatusDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    venueStatusText: {
        fontSize: 9,
        fontWeight: "700",
        color: "#fff",
        textTransform: "uppercase",
    },
    venueRatingBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    venueRatingText: {
        fontSize: 12,
        fontWeight: "700",
    },
    venueAmenities: {
        flexDirection: "row",
        gap: 6,
        marginTop: 8,
    },
    amenityChip: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
    },
    amenityText: {
        fontSize: 10,
    },
    // New venue card styles
    venueCardNew: {
        flexDirection: "row",
        gap: 12,
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
    },
    venueImageContainerNew: {
        width: 100,
        height: 100,
        borderRadius: 12,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
    },
    venueImageNew: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    venueOpenBadge: {
        position: "absolute",
        top: 8,
        left: 8,
        backgroundColor: "rgba(34,197,94,0.9)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    venueOpenText: {
        fontSize: 9,
        fontWeight: "700",
        color: "#fff",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    venueInfoNew: {
        flex: 1,
        justifyContent: "center",
        gap: 4,
    },
    venueTitleRowNew: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    venueNameNew: {
        fontSize: 16,
        fontWeight: "700",
        flex: 1,
    },
    venueRatingBadgeNew: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    venueRatingTextNew: {
        fontSize: 12,
        fontWeight: "700",
    },
    venueTagLineNew: {
        fontSize: 12,
        fontWeight: "500",
    },
    venueLocationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 4,
    },
    venueLocationText: {
        fontSize: 11,
    },
    venueAmenitiesNew: {
        flexDirection: "row",
        gap: 6,
        marginTop: 8,
        flexWrap: "wrap",
    },
    amenityChipNew: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
    },
    amenityTextNew: {
        fontSize: 10,
        fontWeight: "500",
    },
    loadingMoreContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 20,
        gap: 8,
    },
    loadingMoreText: {
        fontSize: 13,
        fontWeight: "500",
    },
    endOfResultsText: {
        fontSize: 12,
        textAlign: "center",
        paddingVertical: 16,
        fontWeight: "500",
    },
});

export default SearchMenu;
