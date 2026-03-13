import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useStore } from "../store/useStore";
import { apiService } from "../services/api";

const { width } = Dimensions.get("window");

const CompetitionDetailsScreen = ({ route, navigation }: { route: any, navigation: any }) => {
    const { competitionId } = route.params;
    const { colors, computedTheme: themeMode } = useStore();
    const isLightTheme = themeMode === "light";

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isFollowed, setIsFollowed] = useState(false);
    const [isTogglingFollow, setIsTogglingFollow] = useState(false);

    const fetchData = async () => {
        try {
            const result = await apiService.getCompetitionDetails(competitionId);
            setData(result);
            setIsFollowed(result.competition.is_followed);
            
            // Set initial selected date to the first match's date if available
            if (result.upcoming_matches?.length > 0) {
                const firstMatchDate = new Date(result.upcoming_matches[0].scheduled_at);
                setSelectedDate(firstMatchDate.toISOString().split('T')[0]!);
            } else {
                setSelectedDate(new Date().toISOString().split('T')[0]!);
            }
        } catch (error) {
            console.error("Error fetching competition details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [competitionId]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, [competitionId]);

    const toggleFollow = async () => {
        if (isTogglingFollow) return;
        
        setIsTogglingFollow(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        try {
            const result = await apiService.toggleLeagueFollow(competitionId);
            setIsFollowed(result.followed);
        } catch (error) {
            console.error("Error toggling follow:", error);
        } finally {
            setIsTogglingFollow(false);
        }
    };

    // Generate 7 days starting from today or first match
    const dateCarouselItems = useMemo(() => {
        if (!data) return [];
        
        const startDate = new Date();
        const items = [];
        
        for (let i = 0; i < 7; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const isoDate = d.toISOString().split('T')[0]!;
            
            items.push({
                day: d.toLocaleDateString("fr-FR", { weekday: 'short' }).replace('.', ''),
                date: d.getDate().toString(),
                fullIso: isoDate,
                hasMatches: data.upcoming_matches?.some((m: any) => 
                    m.scheduled_at.split('T')[0] === isoDate
                )
            });
        }
        return items;
    }, [data]);

    const filteredMatches = useMemo(() => {
        if (!data || !selectedDate) return [];
        return data.upcoming_matches.filter((m: any) => 
            m.scheduled_at.split('T')[0] === selectedDate
        );
    }, [data, selectedDate]);

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!data) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.text }}>Impossible de charger les données.</Text>
                <TouchableOpacity onPress={fetchData} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.primary }}>Réessayer</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const { competition, best_bars, stats } = data;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            >
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Image 
                        source={{ uri: competition.logo_url || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000" }} 
                        style={styles.heroImage}
                    />
                    <LinearGradient
                        colors={["transparent", "rgba(11,11,15,0.4)", "rgba(11,11,15,1)"]}
                        style={styles.heroOverlay}
                    />
                    
                    <SafeAreaView edges={["top"]} style={styles.topNav}>
                        <TouchableOpacity style={styles.navButton} onPress={() => navigation.goBack()}>
                            <MaterialIcons name="chevron-left" size={28} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navButton}>
                            <MaterialIcons name="share" size={22} color="white" />
                        </TouchableOpacity>
                    </SafeAreaView>

                    <View style={styles.heroContent}>
                        <View style={[styles.liveBadge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.liveBadgeText}>LIVE NOW</Text>
                        </View>
                        <Text style={styles.heroTitle}>{competition.name}</Text>
                        <Text style={styles.heroSubtitle}>{competition.type} • {competition.country}</Text>
                        
                        <TouchableOpacity 
                            style={[
                                styles.mainCTA, 
                                { backgroundColor: isFollowed ? 'rgba(255,255,255,0.1)' : colors.primary, borderWidth: isFollowed ? 1 : 0, borderColor: 'rgba(255,255,255,0.2)' }
                            ]}
                            onPress={toggleFollow}
                            disabled={isTogglingFollow}
                        >
                            {isTogglingFollow ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <View style={styles.ctaInner}>
                                    <MaterialIcons name={isFollowed ? "check" : "add"} size={20} color="white" style={{ marginRight: 8 }} />
                                    <Text style={styles.mainCTAText}>
                                        {isFollowed ? "Suivi" : "Suivre & Voir les Bars"}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Tournament Spotlight */}
                <View style={styles.spotlightSection}>
                    <Text style={[styles.sectionLabel, { color: colors.accent }]}>TOURNAMENT SPOTLIGHT</Text>
                    <Text style={[styles.spotlightDesc, { color: colors.textMuted }]}>
                        {competition.description || "Découvrez le sommet de la compétition où les meilleures équipes s'affrontent pour la gloire éternelle."}
                    </Text>

                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                            <Text style={styles.statLabel}>Matchs à venir</Text>
                            <View style={styles.statValueRow}>
                                <Text style={[styles.statValue, { color: colors.text }]}>{stats.matches_left}</Text>
                                <Text style={styles.statUnit}>RESTANTS</Text>
                            </View>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                            <Text style={styles.statLabel}>Bars à proximité</Text>
                            <View style={styles.statValueRow}>
                                <Text style={[styles.statValue, { color: colors.accent }]}>{stats.partner_bars}</Text>
                                <Text style={styles.statUnit}>PARTENAIRES</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Match Schedule */}
                <View style={styles.scheduleSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Prochains Matchs</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Search", { leagueId: competitionId })}>
                            <Text style={[styles.seeAllText, { color: colors.accent }]}>Voir tout</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Dynamic Date Carousel */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateCarousel}>
                        {dateCarouselItems.map((item, idx) => (
                            <TouchableOpacity 
                                key={idx} 
                                style={[
                                    styles.datePill, 
                                    { 
                                        backgroundColor: item.fullIso === selectedDate ? colors.accent10 : colors.surface, 
                                        borderColor: item.fullIso === selectedDate ? colors.accent : colors.border 
                                    }
                                ]}
                                onPress={() => setSelectedDate(item.fullIso)}
                            >
                                <Text style={[styles.dateDay, { color: item.fullIso === selectedDate ? colors.accent : colors.textMuted }]}>{item.day}</Text>
                                <Text style={[styles.dateNum, { color: colors.text }]}>{item.date}</Text>
                                {item.hasMatches && <View style={[styles.hasMatchDot, { backgroundColor: colors.accent }]} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Filtered Match Cards */}
                    <View style={styles.matchList}>
                        {filteredMatches.length > 0 ? (
                            filteredMatches.map((match: any) => (
                                <View key={match.id} style={[styles.matchCard, { backgroundColor: colors.surface }]}>
                                    <View style={styles.matchCardHeader}>
                                        <Text style={styles.matchDate}>
                                            {new Date(match.scheduled_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })} • Main Event
                                        </Text>
                                    </View>

                                    <View style={styles.matchTeamsRow}>
                                        <View style={styles.teamInfo}>
                                            <View style={styles.teamLogoBg}>
                                                <Image source={{ uri: match.homeTeam.logo_url }} style={styles.teamLogo} />
                                            </View>
                                            <Text style={[styles.teamName, { color: colors.text }]}>{match.homeTeam.name}</Text>
                                        </View>
                                        
                                        <View style={styles.vsContainer}>
                                            <Text style={styles.vsText}>VS</Text>
                                            <Text style={styles.venueName}>{match.venue_name || "Stadium"}</Text>
                                        </View>

                                        <View style={styles.teamInfo}>
                                            <View style={styles.teamLogoBg}>
                                                <Image source={{ uri: match.awayTeam.logo_url }} style={styles.teamLogo} />
                                            </View>
                                            <Text style={[styles.teamName, { color: colors.text }]}>{match.awayTeam.name}</Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity 
                                        style={[styles.findVenueButton, { borderColor: colors.border }]}
                                        onPress={() => navigation.navigate("MatchDetail", { matchId: match.id })}
                                    >
                                        <Text style={styles.findVenueText}>Trouver un bar</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyMatches}>
                                <MaterialIcons name="event-busy" size={40} color={colors.textMuted} />
                                <Text style={{ color: colors.textMuted, marginTop: 10 }}>Aucun match ce jour.</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Best Bars */}
                <View style={styles.barsSection}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Meilleurs Bars</Text>
                            <Text style={styles.sectionSubtitle}>Atmosphère garantie.</Text>
                        </View>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.barsCarousel}>
                        {best_bars.map((bar: any) => (
                            <TouchableOpacity 
                                key={bar.id} 
                                style={[styles.barCard, { backgroundColor: colors.surface }]}
                                onPress={() => navigation.navigate("VenueProfile", { venueId: bar.id })}
                            >
                                <View style={styles.barImageContainer}>
                                    <Image source={{ uri: bar.cover_image_url || "https://images.unsplash.com/photo-1514933651103-005eec06c04b" }} style={styles.barImage} />
                                    <View style={[styles.ratingBadge, { backgroundColor: colors.accent }]}>
                                        <Text style={styles.ratingText}>{parseFloat(bar.average_rating || "0").toFixed(1)}</Text>
                                        <MaterialIcons name="star" size={10} color="white" />
                                    </View>
                                </View>
                                <View style={styles.barInfo}>
                                    <Text style={[styles.barName, { color: colors.text }]} numberOfLines={1}>{bar.name}</Text>
                                    <Text style={styles.barDistance}>{bar.city} • 1.2 KM</Text>
                                    <TouchableOpacity style={[styles.reserveButton, { backgroundColor: colors.primary }]}>
                                        <Text style={styles.reserveButtonText}>Réserver</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 20 },
    heroSection: { height: 440, width: '100%', position: 'relative' },
    heroImage: { width: '100%', height: '100%', position: 'absolute', opacity: 0.6 },
    heroOverlay: { ...StyleSheet.absoluteFillObject },
    topNav: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 },
    navButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    heroContent: { position: 'absolute', bottom: 30, left: 20, right: 20 },
    liveBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, marginBottom: 12 },
    liveBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
    heroTitle: { color: 'white', fontSize: 42, fontWeight: '800', lineHeight: 48, marginBottom: 8, fontStyle: 'italic' },
    heroSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 24 },
    mainCTA: { width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    ctaInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    mainCTAText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    spotlightSection: { padding: 20, marginTop: 10 },
    sectionLabel: { fontSize: 10, fontWeight: 'bold', letterSpacing: 2, marginBottom: 12 },
    spotlightDesc: { fontSize: 14, lineHeight: 22, marginBottom: 24 },
    statsRow: { flexDirection: 'row', gap: 15 },
    statCard: { flex: 1, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    statLabel: { fontSize: 9, fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 8 },
    statValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
    statValue: { fontSize: 28, fontWeight: '800' },
    statUnit: { fontSize: 8, fontWeight: 'bold', color: 'rgba(255,255,255,0.3)' },
    scheduleSection: { marginTop: 30 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, marginBottom: 20 },
    sectionTitle: { fontSize: 24, fontWeight: 'bold', fontStyle: 'italic' },
    sectionSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
    seeAllText: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
    dateCarousel: { paddingHorizontal: 20, gap: 12, paddingBottom: 20 },
    datePill: { width: 64, height: 85, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
    dateDay: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    dateNum: { fontSize: 20, fontWeight: 'bold' },
    hasMatchDot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },
    matchList: { paddingHorizontal: 20, gap: 20 },
    matchCard: { padding: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    matchCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    matchDate: { fontSize: 10, fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' },
    matchTeamsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    teamInfo: { alignItems: 'center', gap: 12, width: 80 },
    teamLogoBg: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#2a2a30', alignItems: 'center', justifyContent: 'center', padding: 12 },
    teamLogo: { width: '100%', height: '100%', resizeMode: 'contain' },
    teamName: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center' },
    vsContainer: { alignItems: 'center' },
    vsText: { color: 'rgba(255,255,255,0.3)', fontSize: 20, fontWeight: '900', fontStyle: 'italic' },
    venueName: { fontSize: 9, fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginTop: 4 },
    findVenueButton: { width: '100%', paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
    findVenueText: { color: 'white', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
    barsSection: { marginTop: 40 },
    barsCarousel: { paddingHorizontal: 20, gap: 16, paddingBottom: 20 },
    barCard: { width: 260, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    barImageContainer: { height: 150, width: '100%', position: 'relative' },
    barImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    ratingBadge: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    barInfo: { padding: 16 },
    barName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    barDistance: { fontSize: 10, fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', marginBottom: 16 },
    reserveButton: { width: '100%', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
    reserveButtonText: { color: 'white', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
    emptyMatches: { alignItems: 'center', padding: 40, borderDash: [5, 5] },
});

export default CompetitionDetailsScreen;
