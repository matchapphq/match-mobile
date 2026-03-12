import React from "react";
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
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useStore } from "../store/useStore";

const { width } = Dimensions.get("window");

const DiscoverScreen = () => {
    const { colors, computedTheme: themeMode } = useStore();
    const isLightTheme = themeMode === "light";

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isLightTheme ? "dark-content" : "light-content"} />
            <SafeAreaView edges={["top"]} style={styles.safeArea}>
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
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
                            />
                        </View>
                        <TouchableOpacity style={styles.mapButton}>
                            <MaterialIcons name="map" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Main Banner */}
                    <View style={[styles.bannerContainer, { backgroundColor: colors.surface }]}>
                        <Image
                            source={{ uri: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2070&auto=format&fit=crop" }}
                            style={styles.bannerImage}
                        />
                        <LinearGradient
                            colors={["transparent", "rgba(0,0,0,0.8)"]}
                            style={styles.bannerOverlay}
                        />
                        <View style={styles.bannerContent}>
                            <View style={[styles.bannerBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                                <Text style={styles.bannerBadgeText}>COMPÉTITION</Text>
                            </View>
                            <Text style={styles.bannerTitle}>FIFA WORLD CUP</Text>
                            <Text style={styles.bannerSubtitle}>Qatar 2022 • Du 20 Nov au 18 Dec</Text>
                            <TouchableOpacity style={[styles.bannerCTA, { backgroundColor: colors.primary }]}>
                                <Text style={styles.bannerCTAText}>Voir les bars</Text>
                                <MaterialIcons name="arrow-forward" size={14} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Teams Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tes Équipes</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.teamsScroll} contentContainerStyle={styles.teamsContent}>
                        {[
                            { id: 1, name: "PSG", live: true },
                            { id: 2, name: "Lakers", live: false },
                            { id: 3, name: "Real Madrid", live: false },
                        ].map((team) => (
                            <View key={team.id} style={styles.teamContainer}>
                                <View style={[styles.teamAvatarContainer, { backgroundColor: colors.surface, borderColor: team.live ? colors.accent : colors.border }]}>
                                    <View style={[styles.teamAvatarInner, { backgroundColor: isLightTheme ? colors.background : "#2a2a30" }]}>
                                        <MaterialCommunityIcons name="soccer" size={24} color={team.live ? colors.accent : colors.textMuted} />
                                    </View>
                                    {team.live && (
                                        <View style={styles.liveLabel}>
                                            <Text style={styles.liveLabelText}>LIVE</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={[styles.teamName, { color: colors.text }]}>{team.name}</Text>
                            </View>
                        ))}
                        <TouchableOpacity style={styles.addTeamContainer}>
                            <View style={[styles.addTeamCircle, { borderColor: colors.border }]}>
                                <MaterialIcons name="add" size={24} color={colors.textMuted} />
                            </View>
                            <Text style={[styles.addTeamText, { color: colors.textMuted }]}>Ajouter</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* Competitions Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Compétitions populaires</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.competitionsScroll} contentContainerStyle={styles.competitionsContent}>
                        {[
                            { icon: "sports-soccer", name: "World Cup" },
                            { icon: "sports-tennis", name: "Roland-Garros" },
                            { icon: "sports-basketball", name: "NBA Finals" },
                            { icon: "directions-car", name: "Formula 1" },
                            { icon: "sports-rugby", name: "Top 14" },
                        ].map((comp, idx) => (
                            <TouchableOpacity key={idx} style={styles.compContainer}>
                                <View style={[styles.compIconCircle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <MaterialIcons name={comp.icon as any} size={20} color={colors.accent} />
                                </View>
                                <Text style={[styles.compName, { color: colors.textMuted }]}>{comp.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Featured Matches */}
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>À la une</Text>
                    </View>
                    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
                        {[1, 2].map((match) => (
                            <View key={match} style={[styles.featuredCard, { backgroundColor: colors.surface }]}>
                                <Image
                                    source={{ uri: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1974&auto=format&fit=crop" }}
                                    style={styles.featuredImage}
                                />
                                <LinearGradient
                                    colors={["transparent", "rgba(0,0,0,0.9)"]}
                                    style={styles.featuredOverlay}
                                />
                                <View style={[styles.featuredLabel, { backgroundColor: colors.primary }]}>
                                    <Text style={styles.featuredLabelText}>MATCH CHOC</Text>
                                </View>
                                <View style={styles.featuredCardContent}>
                                    <View style={styles.featuredTopRow}>
                                        <Text style={[styles.featuredLeague, { color: colors.accent }]}>La Liga • 21:00</Text>
                                        <TouchableOpacity style={[styles.reserveButton, { backgroundColor: colors.white }]}>
                                            <Text style={styles.reserveButtonText}>Réserver</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.featuredMatchTitle}>El Clásico</Text>
                                    <Text style={styles.featuredTeams}>Real Madrid vs FC Barcelone</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Recently Viewed */}
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Récemment vus</Text>
                        <TouchableOpacity>
                            <Text style={[styles.clearText, { color: colors.textMuted }]}>Effacer</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentScroll} contentContainerStyle={styles.recentContent}>
                        {[1, 2].map((bar) => (
                            <View key={bar} style={[styles.recentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Image
                                    source={{ uri: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=2070&auto=format&fit=crop" }}
                                    style={styles.recentImage}
                                />
                                <View style={styles.recentInfo}>
                                    <Text style={[styles.recentTitle, { color: colors.text }]}>The Lions Pub</Text>
                                    <Text style={[styles.recentSub, { color: colors.textMuted }]}>Pub irlandais • Paris 11</Text>
                                    <Text style={[styles.recentDetail, { color: colors.textMuted }]}>Happy Hour 17h-20h</Text>
                                </View>
                                <View style={[styles.ratingBadge, { backgroundColor: colors.accent10 }]}>
                                    <Text style={[styles.ratingText, { color: colors.accent }]}>9.2</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Upcoming Matches */}
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Matchs à venir</Text>
                    </View>
                    <View style={styles.upcomingContainer}>
                        {[
                            { t1: "PSG", t2: "Marseille", time: "21:00", league: "Ligue 1", day: "Ce soir" },
                            { t1: "Lakers", t2: "Warriors", time: "03:00", league: "NBA", day: "Demain" },
                        ].map((match, idx) => (
                            <View key={idx} style={[styles.upcomingRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <View style={styles.upcomingTeam}>
                                    <View style={[styles.smallBadge, { backgroundColor: colors.surfaceAlt }]}>
                                        <Text style={[styles.smallBadgeText, { color: colors.text }]}>{match.t1.substring(0, 1)}</Text>
                                    </View>
                                    <View>
                                        <Text style={[styles.upcomingTeamName, { color: colors.text }]}>{match.t1}</Text>
                                        <Text style={[styles.upcomingLeague, { color: colors.textMuted }]}>{match.league}</Text>
                                    </View>
                                </View>
                                <View style={styles.upcomingCenter}>
                                    <View style={[styles.timePill, { backgroundColor: colors.accent10, borderColor: colors.accent20 }]}>
                                        <Text style={[styles.timeText, { color: colors.accent }]}>{match.time}</Text>
                                    </View>
                                    <Text style={[styles.dayText, { color: colors.textMuted }]}>{match.day}</Text>
                                </View>
                                <View style={[styles.upcomingTeam, { justifyContent: 'flex-end' }]}>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={[styles.upcomingTeamName, { color: colors.text }]}>{match.t2}</Text>
                                        <Text style={[styles.upcomingLeague, { color: colors.textMuted }]}>{match.league}</Text>
                                    </View>
                                    <View style={[styles.smallBadge, { backgroundColor: colors.surfaceAlt }]}>
                                        <Text style={[styles.smallBadgeText, { color: colors.text }]}>{match.t2.substring(0, 1)}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                    
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
        width: 60,
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
    },
    liveLabel: {
        position: "absolute",
        bottom: -2,
        backgroundColor: "#e11d48",
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: "transparent", // dynamic overlay would be better but this works for now
    },
    liveLabelText: {
        color: "white",
        fontSize: 7,
        fontWeight: "bold",
    },
    teamName: {
        fontSize: 9,
        fontWeight: "500",
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
    competitionsScroll: {
        marginBottom: 25,
    },
    competitionsContent: {
        paddingHorizontal: 20,
        gap: 12,
    },
    compContainer: {
        alignItems: "center",
        width: 60,
    },
    compIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },
    compName: {
        fontSize: 8,
        fontWeight: "bold",
        textAlign: "center",
        textTransform: "uppercase",
    },
    featuredScroll: {
        marginBottom: 25,
    },
    featuredCard: {
        width: width * 0.7,
        height: 150,
        marginLeft: 20,
        borderRadius: 16,
        overflow: "hidden",
    },
    featuredImage: {
        width: "100%",
        height: "100%",
    },
    featuredOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    featuredLabel: {
        position: "absolute",
        top: 10,
        left: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    featuredLabelText: {
        color: "white",
        fontSize: 8,
        fontWeight: "bold",
    },
    featuredCardContent: {
        position: "absolute",
        bottom: 12,
        left: 12,
        right: 12,
    },
    featuredTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    featuredLeague: {
        fontSize: 9,
        fontWeight: "bold",
    },
    reserveButton: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    reserveButtonText: {
        color: "black",
        fontSize: 9,
        fontWeight: "bold",
    },
    featuredMatchTitle: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
    },
    featuredTeams: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 10,
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
        fontSize: 9,
        fontWeight: "bold",
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
});

export default DiscoverScreen;
