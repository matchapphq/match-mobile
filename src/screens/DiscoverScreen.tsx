import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    TextInput,
    StatusBar,
    RefreshControl,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useStore } from "../store/useStore";

const { width } = Dimensions.get("window");

const DiscoverScreen = ({ navigation }: { navigation: any }) => {
    const { 
        colors, 
        computedTheme: themeMode, 
        user, 
        discoveryHome, 
        fetchDiscoveryHome,
        clearDiscoveryHistory,
        isLoading 
    } = useStore();
    
    const isLightTheme = themeMode === "light";
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchDiscoveryHome();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchDiscoveryHome();
        setRefreshing(false);
    }, []);

    // Helper to get initials for placeholders
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const hasTeams = discoveryHome.followed_teams?.length > 0;
    const hasHistory = discoveryHome.recently_viewed?.length > 0;
    const hasMatches = discoveryHome.upcoming_matches?.length > 0;
    const activeBanner = discoveryHome.banners?.[0];

    // Default welcome banner if no dynamic banners exist
    const defaultBanner = {
        title: "BIENVENUE SUR MATCH",
        subtitle: "Ton nouveau QG sportif",
        date_range_label: "Prêt pour le coup d'envoi ?",
        image_url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000&auto=format&fit=crop",
        isGeneric: true
    };

    const bannerToDisplay = activeBanner || defaultBanner;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isLightTheme ? "dark-content" : "light-content"} />
            <SafeAreaView edges={["top"]} style={styles.safeArea}>
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl 
                            refreshing={refreshing} 
                            onRefresh={onRefresh} 
                            tintColor={colors.primary}
                            colors={[colors.primary]}
                        />
                    }
                >
                    {/* Header Section */}
                    <View style={styles.header}>
                        <View style={styles.headerTabs}>
                            <TouchableOpacity style={styles.activeTab}>
                                <Text style={[styles.activeTabText, { color: colors.text }]}>Pour toi</Text>
                                <View style={[styles.activeTabUnderline, { backgroundColor: colors.accent }]} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.feedBadge}>
                                <Text style={[styles.feedText, { color: colors.textMuted }]}>Feed</Text>
                                <View style={styles.newBadge}>
                                    <Text style={styles.newBadgeText}>New</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Location Selector */}
                    <TouchableOpacity style={styles.locationSelector}>
                        <Text style={[styles.locationText, { color: colors.text }]}>Ma position actuelle</Text>
                        <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.text} />
                    </TouchableOpacity>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <MaterialIcons name="search" size={22} color={colors.textMuted} style={styles.searchIcon} />
                            <TextInput
                                placeholder="Rechercher un bar, un plat..."
                                placeholderTextColor={colors.textMuted}
                                style={[styles.searchInput, { color: colors.text }]}
                                onFocus={() => navigation.navigate("Search")}
                            />
                        </View>
                        <TouchableOpacity style={styles.mapButton} onPress={() => navigation.navigate("Map")}>
                            <MaterialIcons name="map" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Main Banner */}
                    <View style={[styles.bannerContainer, { backgroundColor: colors.surface }]}>
                        <Image
                            source={{ uri: bannerToDisplay.image_url }}
                            style={styles.bannerImage}
                        />
                        <LinearGradient
                            colors={["transparent", "rgba(0,0,0,0.85)"]}
                            style={styles.bannerOverlay}
                        />
                        <View style={styles.bannerContent}>
                            <View style={[styles.bannerBadge, { backgroundColor: bannerToDisplay.isGeneric ? colors.accent : "rgba(255,255,255,0.2)" }]}>
                                <Text style={styles.bannerBadgeText}>{bannerToDisplay.isGeneric ? "À DÉCOUVRIR" : "COMPÉTITION"}</Text>
                            </View>
                            <Text style={styles.bannerTitle}>{bannerToDisplay.title}</Text>
                            <Text style={styles.bannerSubtitle}>{bannerToDisplay.subtitle} • {bannerToDisplay.date_range_label}</Text>
                            <TouchableOpacity 
                                style={[styles.bannerCTA, { backgroundColor: colors.primary }]}
                                onPress={() => bannerToDisplay.tournament_id ? navigation.navigate("Search", { tournamentId: bannerToDisplay.tournament_id }) : navigation.navigate("Map")}
                            >
                                <Text style={styles.bannerCTAText}>{bannerToDisplay.isGeneric ? "Explorer" : "Voir les bars"}</Text>
                                <MaterialIcons name="arrow-forward" size={14} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Teams Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tes Équipes</Text>
                    </View>
                    {hasTeams ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.teamsScroll} contentContainerStyle={styles.teamsContent}>
                            {discoveryHome.followed_teams.map((team: any) => (
                                <TouchableOpacity key={team.id} style={styles.teamContainer} onPress={() => team.live_match_id && navigation.navigate("MatchDetails", { matchId: team.live_match_id })}>
                                    <View style={[styles.teamAvatarContainer, { backgroundColor: colors.surface, borderColor: team.is_live ? colors.accent : colors.border }]}>
                                        <View style={[styles.teamAvatarInner, { backgroundColor: isLightTheme ? colors.background : "#2a2a30" }]}>
                                            {team.logo_url ? (
                                                <Image source={{ uri: team.logo_url }} style={styles.teamLogo} />
                                            ) : (
                                                <MaterialCommunityIcons name="soccer" size={24} color={team.is_live ? colors.accent : colors.textMuted} />
                                            )}
                                        </View>
                                        {team.is_live && (
                                            <View style={styles.liveLabel}>
                                                <Text style={styles.liveLabelText}>LIVE</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>{team.name}</Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity style={styles.addTeamContainer} onPress={() => navigation.navigate("EditProfile")}>
                                <View style={[styles.addTeamCircle, { borderColor: colors.border }]}>
                                    <MaterialIcons name="add" size={24} color={colors.textMuted} />
                                </View>
                                <Text style={[styles.addTeamText, { color: colors.textMuted }]}>Ajouter</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    ) : (
                        <View style={styles.emptyTeamsContainer}>
                            <View style={[styles.emptyTeamsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <MaterialIcons name="star-outline" size={32} color={colors.accent} />
                                <View style={styles.emptyTeamsContent}>
                                    <Text style={[styles.emptyTeamsTitle, { color: colors.text }]}>Suis tes équipes favorites</Text>
                                    <Text style={[styles.emptyTeamsSubtitle, { color: colors.textMuted }]}>Ne rate plus aucun match en direct et reçois des alertes.</Text>
                                </View>
                                <TouchableOpacity 
                                    style={[styles.emptyTeamsAction, { backgroundColor: colors.accent10 }]}
                                    onPress={() => navigation.navigate("EditProfile")}
                                >
                                    <Text style={[styles.emptyTeamsActionText, { color: colors.accent }]}>Configurer</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Competitions Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Compétitions populaires</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.competitionsScroll} contentContainerStyle={styles.competitionsContent}>
                        {discoveryHome.popular_competitions?.map((comp: any, idx: number) => (
                            <TouchableOpacity key={comp.id || idx} style={styles.compContainer} onPress={() => navigation.navigate("Search", { leagueId: comp.id })}>
                                <View style={[styles.compIconCircle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    {comp.logo_url ? (
                                        <Image source={{ uri: comp.logo_url }} style={styles.compLogo} />
                                    ) : (
                                        <MaterialIcons name="emoji-events" size={20} color={colors.accent} />
                                    )}
                                </View>
                                <Text style={[styles.compName, { color: colors.textMuted }]} numberOfLines={2}>{comp.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Recently Viewed */}
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Récemment vus</Text>
                        {hasHistory && (
                            <TouchableOpacity onPress={clearDiscoveryHistory}>
                                <Text style={[styles.clearText, { color: colors.textMuted }]}>Effacer</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    {hasHistory ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentScroll} contentContainerStyle={styles.recentContent}>
                            {discoveryHome.recently_viewed.map((item: any) => (
                                <TouchableOpacity 
                                    key={item.venue.id} 
                                    style={[styles.recentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                    onPress={() => navigation.navigate("VenueDetails", { venueId: item.venue.id })}
                                >
                                    <Image
                                        source={{ uri: item.venue.photos?.[0]?.photo_url || "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=2070&auto=format&fit=crop" }}
                                        style={styles.recentImage}
                                    />
                                    <View style={styles.recentInfo}>
                                        <Text style={[styles.recentTitle, { color: colors.text }]} numberOfLines={1}>{item.venue.name}</Text>
                                        <Text style={[styles.recentSub, { color: colors.textMuted }]} numberOfLines={1}>{item.venue.type} • {item.venue.city}</Text>
                                        <Text style={[styles.recentDetail, { color: colors.textMuted }]}>Vu {new Date(item.viewed_at).toLocaleDateString()}</Text>
                                    </View>
                                    <View style={[styles.ratingBadge, { backgroundColor: colors.accent10 }]}>
                                        <Text style={[styles.ratingText, { color: colors.accent }]}>{parseFloat(item.venue.average_rating || "0").toFixed(1)}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={styles.emptyHistoryContainer}>
                            <LinearGradient
                                colors={[isLightTheme ? "#f1f5f9" : "#1c1c21", colors.background]}
                                style={[styles.emptyHistoryCard, { borderColor: colors.border, borderStyle: 'dashed', borderWidth: 1.5 }]}
                            >
                                <MaterialIcons name="explore" size={40} color={colors.textMuted} />
                                <Text style={[styles.emptyHistoryTitle, { color: colors.text }]}>Aucun bar consulté</Text>
                                <Text style={[styles.emptyHistorySubtitle, { color: colors.textMuted }]}>Lance ta première recherche pour trouver les meilleurs spots autour de toi.</Text>
                                <TouchableOpacity 
                                    style={[styles.emptyHistoryAction, { backgroundColor: colors.primary }]}
                                    onPress={() => navigation.navigate("Map")}
                                >
                                    <Text style={styles.emptyHistoryActionText}>Lancer la recherche</Text>
                                    <MaterialIcons name="near-me" size={18} color="#fff" />
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    )}

                    {/* Upcoming Matches */}
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Matchs à venir</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Search")}>
                            <Text style={[styles.seeAllText, { color: colors.accent }]}>Voir tout</Text>
                        </TouchableOpacity>
                    </View>
                    {hasMatches ? (
                        <View style={styles.upcomingContainer}>
                            {discoveryHome.upcoming_matches.map((match: any, idx: number) => (
                                <TouchableOpacity key={match.id || idx} style={[styles.upcomingRow, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => navigation.navigate("MatchDetails", { matchId: match.id })}>
                                    <View style={styles.upcomingTeam}>
                                        <View style={[styles.smallBadge, { backgroundColor: colors.surfaceAlt }]}>
                                            {match.homeTeam?.logo_url ? (
                                                <Image source={{ uri: match.homeTeam.logo_url }} style={styles.smallTeamLogo} />
                                            ) : (
                                                <Text style={[styles.smallBadgeText, { color: colors.text }]}>{getInitials(match.homeTeam?.name || "T")}</Text>
                                            )}
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.upcomingTeamName, { color: colors.text }]} numberOfLines={1}>{match.homeTeam?.name}</Text>
                                            <Text style={[styles.upcomingLeague, { color: colors.textMuted }]} numberOfLines={1}>{match.league?.name}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.upcomingCenter}>
                                        <View style={[styles.timePill, { backgroundColor: colors.accent10, borderColor: colors.accent20 }]}>
                                            <Text style={[styles.timeText, { color: colors.accent }]}>
                                                {new Date(match.scheduled_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>
                                        <Text style={[styles.dayText, { color: colors.textMuted }]}>
                                            {new Date(match.scheduled_at).toLocaleDateString("fr-FR", { weekday: 'short', day: 'numeric' })}
                                        </Text>
                                    </View>
                                    <View style={[styles.upcomingTeam, { justifyContent: 'flex-end' }]}>
                                        <View style={{ alignItems: 'flex-end', flex: 1 }}>
                                            <Text style={[styles.upcomingTeamName, { color: colors.text }]} numberOfLines={1}>{match.awayTeam?.name}</Text>
                                            <Text style={[styles.upcomingLeague, { color: colors.textMuted }]} numberOfLines={1}>{match.league?.name}</Text>
                                        </View>
                                        <View style={[styles.smallBadge, { backgroundColor: colors.surfaceAlt }]}>
                                            {match.awayTeam?.logo_url ? (
                                                <Image source={{ uri: match.awayTeam.logo_url }} style={styles.smallTeamLogo} />
                                            ) : (
                                                <Text style={[styles.smallBadgeText, { color: colors.text }]}>{getInitials(match.awayTeam?.name || "T")}</Text>
                                            )}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity 
                                style={[styles.moreMatchesButton, { borderColor: colors.border }]}
                                onPress={() => navigation.navigate("Search")}
                            >
                                <Text style={[styles.moreMatchesText, { color: colors.textMuted }]}>Trouver d'autres matchs</Text>
                                <MaterialIcons name="keyboard-arrow-right" size={18} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.emptyMatchesContainer}>
                            <View style={[styles.emptyMatchesCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <MaterialIcons name="event-busy" size={32} color={colors.textMuted} />
                                <Text style={[styles.emptyMatchesTitle, { color: colors.text }]}>Aucun match prévu</Text>
                                <Text style={[styles.emptyMatchesSubtitle, { color: colors.textMuted }]}>Reviens plus tard pour voir les prochaines diffusions ou change tes filtres.</Text>
                                <TouchableOpacity 
                                    style={[styles.emptyMatchesAction, { backgroundColor: colors.accent10 }]}
                                    onPress={() => navigation.navigate("Search")}
                                >
                                    <Text style={[styles.emptyMatchesActionText, { color: colors.accent }]}>Explorer</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    
                    <View style={{ height: 120 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    header: {
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 10,
    },
    headerTabs: {
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
    },
    activeTab: {
        paddingVertical: 8,
    },
    activeTabText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    activeTabUnderline: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        borderRadius: 2,
    },
    feedBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    feedText: {
        fontSize: 18,
        fontWeight: "500",
    },
    newBadge: {
        backgroundColor: "#e11d48",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    newBadgeText: {
        color: "white",
        fontSize: 10,
        fontWeight: "bold",
    },
    locationSelector: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 15,
        gap: 4,
    },
    locationText: {
        fontSize: 14,
        fontWeight: "bold",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 20,
    },
    searchBar: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 16,
        paddingHorizontal: 15,
        height: 48,
        borderWidth: 1,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
    },
    mapButton: {
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
    },
    bannerContainer: {
        width: width - 40,
        height: 180,
        alignSelf: "center",
        borderRadius: 24,
        overflow: "hidden",
        marginBottom: 25,
    },
    bannerImage: {
        width: "100%",
        height: "100%",
    },
    bannerOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    bannerContent: {
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
    },
    bannerBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 8,
    },
    bannerBadgeText: {
        color: "white",
        fontSize: 10,
        fontWeight: "bold",
    },
    bannerTitle: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold",
        fontStyle: "italic",
        letterSpacing: -0.5,
    },
    bannerSubtitle: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 11,
        marginTop: 2,
    },
    bannerCTA: {
        alignSelf: "flex-end",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    bannerCTAText: {
        color: "white",
        fontSize: 11,
        fontWeight: "bold",
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "bold",
    },
    teamsScroll: {
        marginBottom: 25,
    },
    teamsContent: {
        paddingHorizontal: 20,
        gap: 15,
    },
    teamContainer: {
        alignItems: "center",
        width: 65,
    },
    teamAvatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },
    teamAvatarInner: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    teamLogo: {
        width: 32,
        height: 32,
        resizeMode: "contain",
    },
    liveLabel: {
        position: "absolute",
        bottom: -2,
        backgroundColor: "#e11d48",
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: "#0b0b0f", 
    },
    liveLabelText: {
        color: "white",
        fontSize: 7,
        fontWeight: "bold",
    },
    teamName: {
        fontSize: 9,
        fontWeight: "500",
        textAlign: "center",
    },
    addTeamContainer: {
        alignItems: "center",
        width: 60,
    },
    addTeamCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderStyle: "dashed",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },
    addTeamText: {
        fontSize: 9,
        fontWeight: "500",
    },
    emptyTeamsContainer: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    emptyTeamsCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        gap: 12,
    },
    emptyTeamsContent: {
        flex: 1,
        gap: 2,
    },
    emptyTeamsTitle: {
        fontSize: 13,
        fontWeight: "700",
    },
    emptyTeamsSubtitle: {
        fontSize: 11,
        lineHeight: 15,
    },
    emptyTeamsAction: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    emptyTeamsActionText: {
        fontSize: 11,
        fontWeight: "700",
    },
    competitionsScroll: {
        marginBottom: 25,
    },
    competitionsContent: {
        paddingHorizontal: 20,
        gap: 12,
    },
    compContainer: {
        alignItems: "center",
        width: 70,
    },
    compIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
        overflow: "hidden",
    },
    compLogo: {
        width: 28,
        height: 28,
        resizeMode: "contain",
    },
    compName: {
        fontSize: 8,
        fontWeight: "bold",
        textAlign: "center",
        textTransform: "uppercase",
    },
    recentScroll: {
        marginBottom: 25,
    },
    recentContent: {
        paddingHorizontal: 20,
        gap: 15,
    },
    recentCard: {
        width: width * 0.65,
        borderRadius: 16,
        padding: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderWidth: 1,
    },
    recentImage: {
        width: 56,
        height: 56,
        borderRadius: 12,
    },
    recentInfo: {
        flex: 1,
    },
    recentTitle: {
        fontSize: 12,
        fontWeight: "bold",
    },
    recentSub: {
        fontSize: 9,
    },
    recentDetail: {
        fontSize: 8,
        marginTop: 2,
    },
    ratingBadge: {
        position: "absolute",
        top: 8,
        right: 8,
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
    },
    ratingText: {
        fontSize: 8,
        fontWeight: "bold",
    },
    clearText: {
        fontSize: 10,
        fontWeight: "bold",
    },
    emptyHistoryContainer: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    emptyHistoryCard: {
        padding: 24,
        borderRadius: 24,
        alignItems: "center",
        gap: 12,
    },
    emptyHistoryTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginTop: 4,
    },
    emptyHistorySubtitle: {
        fontSize: 12,
        textAlign: "center",
        lineHeight: 18,
        paddingHorizontal: 10,
    },
    emptyHistoryAction: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
        marginTop: 8,
    },
    emptyHistoryActionText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "700",
    },
    upcomingContainer: {
        paddingHorizontal: 20,
        gap: 10,
    },
    upcomingRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
    },
    upcomingTeam: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    smallBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    smallTeamLogo: {
        width: 20,
        height: 20,
        resizeMode: "contain",
    },
    smallBadgeText: {
        fontSize: 10,
        fontWeight: "bold",
    },
    upcomingTeamName: {
        fontSize: 12,
        fontWeight: "bold",
    },
    upcomingLeague: {
        fontSize: 8,
    },
    upcomingCenter: {
        alignItems: "center",
        paddingHorizontal: 10,
    },
    timePill: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
    },
    timeText: {
        fontSize: 9,
        fontWeight: "bold",
    },
    dayText: {
        fontSize: 7,
        marginTop: 2,
    },
    seeAllText: {
        fontSize: 12,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    moreMatchesButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        marginTop: 8,
        borderWidth: 1,
        borderStyle: "dashed",
        borderRadius: 14,
        gap: 4,
    },
    moreMatchesText: {
        fontSize: 12,
        fontWeight: "600",
    },
    emptyMatchesContainer: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    emptyMatchesCard: {
        alignItems: "center",
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        gap: 8,
    },
    emptyMatchesTitle: {
        fontSize: 15,
        fontWeight: "700",
        marginTop: 4,
    },
    emptyMatchesSubtitle: {
        fontSize: 12,
        textAlign: "center",
        lineHeight: 18,
        marginBottom: 8,
    },
    emptyMatchesAction: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    emptyMatchesActionText: {
        fontSize: 13,
        fontWeight: "700",
    },
});

export default DiscoverScreen;
