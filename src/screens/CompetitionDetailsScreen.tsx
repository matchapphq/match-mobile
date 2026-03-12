import React, { useEffect, useState, useCallback } from "react";
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
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useStore } from "../store/useStore";
import { apiService } from "../services/api";

const { width } = Dimensions.get("window");

const CompetitionDetailsScreen = ({ route, navigation }: { route: any, navigation: any }) => {
    const { competitionId, competitionName } = route.params;
    const { colors, computedTheme: themeMode } = useStore();
    const isLightTheme = themeMode === "light";

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState<any>(null);
    const [selectedDateIdx, setSelectedDateIdx] = useState(0);

    const fetchData = async () => {
        try {
            const result = await apiService.getCompetitionDetails(competitionId);
            setData(result);
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

    const { competition, upcoming_matches, best_bars, stats } = data;

    // Dates for the carousel
    const dates = [
        { day: 'Lun', date: '15' },
        { day: 'Mar', date: '16' },
        { day: 'Mer', date: '17' },
        { day: 'Jeu', date: '18' },
        { day: 'Ven', date: '19' },
        { day: 'Sam', date: '20' },
        { day: 'Dim', date: '21' },
    ];

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
                        source={{ uri: competition.logo_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuB58__Tnl3Tk5Zk0Zn50rAVXBTz3L4r5PwVugU-VSQ3JNAYydzeIzS7BNPkWzAzTUUhufA0bVga_Q97N-J4ePOoDQUxTSA9dbSCiITFfrsjadXeoP_H-phSpFMNKrG-T4pzU-Rk_oX6Qo7Fru5-wgTclp2ST15CBsmIouHJPEBxoBONE_BLgKeqLB5UkEOAGAyU-K9CMtWgJy-z23vy1cYAk3ASOehb8qL91XAumizAwJMfl8opHd5U_OAYg0oSc5C7jNV_p7xrFu4M" }} 
                        style={styles.heroImage}
                    />
                    <LinearGradient
                        colors={["transparent", "rgba(11,11,15,0.4)", "rgba(11,11,15,1)"]}
                        style={styles.heroOverlay}
                    />
                    
                    {/* Top Navigation */}
                    <SafeAreaView edges={["top"]} style={styles.topNav}>
                        <TouchableOpacity style={styles.navButton} onPress={() => navigation.goBack()}>
                            <MaterialIcons name="chevron-left" size={28} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navButton}>
                            <MaterialIcons name="share" size={22} color="white" />
                        </TouchableOpacity>
                    </SafeAreaView>

                    {/* Hero Content */}
                    <View style={styles.heroContent}>
                        <View style={[styles.liveBadge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.liveBadgeText}>LIVE NOW</Text>
                        </View>
                        <Text style={styles.heroTitle}>{competition.name}</Text>
                        <Text style={styles.heroSubtitle}>{competition.type} • {competition.country}</Text>
                        <TouchableOpacity style={[styles.mainCTA, { backgroundColor: colors.primary }]}>
                            <Text style={styles.mainCTAText}>Suivre & Voir les Bars</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Tournament Spotlight */}
                <View style={styles.spotlightSection}>
                    <Text style={[styles.sectionLabel, { color: colors.accent }]}>TOURNAMENT SPOTLIGHT</Text>
                    <Text style={[styles.spotlightDesc, { color: colors.textMuted }]}>
                        {competition.description || "Découvrez le sommet de la compétition où les meilleures équipes s'affrontent pour la gloire éternelle sous les projecteurs."}
                    </Text>

                    {/* Stat Cards */}
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

                    {/* Date Carousel */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateCarousel}>
                        {dates.map((date, idx) => (
                            <TouchableOpacity 
                                key={idx} 
                                style={[
                                    styles.datePill, 
                                    { backgroundColor: idx === selectedDateIdx ? colors.accent10 : 'transparent', borderColor: idx === selectedDateIdx ? colors.accent : colors.border }
                                ]}
                                onPress={() => setSelectedDateIdx(idx)}
                            >
                                <Text style={[styles.dateDay, { color: idx === selectedDateIdx ? colors.accent : colors.textMuted }]}>{date.day}</Text>
                                <Text style={[styles.dateNum, { color: colors.text }]}>{date.date}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Match Cards */}
                    <View style={styles.matchList}>
                        {upcoming_matches.length > 0 ? (
                            upcoming_matches.map((match: any) => (
                                <View key={match.id} style={[styles.matchCard, { backgroundColor: colors.surface }]}>
                                    <View style={styles.matchCardHeader}>
                                        <Text style={styles.matchDate}>
                                            {new Date(match.scheduled_at).toLocaleDateString("fr-FR", { weekday: 'long', day: 'numeric', month: 'long' })} • {new Date(match.scheduled_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                        <Text style={styles.matchStatus}>ÉVÉNEMENT</Text>
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

                                    <Text style={styles.matchQuote}>
                                        "{match.description || "Un choc au sommet entre deux géants de la compétition. Préparez-vous pour une soirée de maîtrise technique."}"
                                    </Text>

                                    <TouchableOpacity 
                                        style={[styles.findVenueButton, { borderColor: colors.border }]}
                                        onPress={() => navigation.navigate("MatchDetail", { matchId: match.id })}
                                    >
                                        <Text style={styles.findVenueText}>Trouver un bar pour voir le match</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyMatches}>
                                <Text style={{ color: colors.textMuted }}>Aucun match programmé pour le moment.</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Best Bars */}
                <View style={styles.barsSection}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Meilleurs Bars</Text>
                            <Text style={styles.sectionSubtitle}>Sélectionnés pour leur atmosphère.</Text>
                        </View>
                        <TouchableOpacity style={styles.filterButton}>
                            <Text style={[styles.filterText, { color: colors.accent }]}>FILTRER</Text>
                        </TouchableOpacity>
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
                                    <View style={styles.barHeader}>
                                        <Text style={[styles.barName, { color: colors.text }]} numberOfLines={1}>{bar.name}</Text>
                                        <Text style={styles.barDistance}>1.2 KM</Text>
                                    </View>
                                    <Text style={styles.barDesc} numberOfLines={2}>
                                        Situé au cœur du quartier, offrant une expérience visuelle inégalée avec des écrans géants.
                                    </Text>
                                    <View style={styles.tagRow}>
                                        <View style={styles.tag}><Text style={styles.tagText}>BIÈRE ARTISANALE</Text></View>
                                        <View style={styles.tag}><Text style={styles.tagText}>TERRASSE</Text></View>
                                    </View>
                                    <TouchableOpacity style={[styles.reserveButton, { backgroundColor: colors.primary }]}>
                                        <Text style={styles.reserveButtonText}>Réserver une Table</Text>
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
    datePill: { width: 64, height: 80, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
    dateDay: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    dateNum: { fontSize: 20, fontWeight: 'bold' },
    matchList: { paddingHorizontal: 20, gap: 20 },
    matchCard: { padding: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    matchCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    matchDate: { fontSize: 10, fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' },
    matchStatus: { fontSize: 10, fontWeight: 'bold', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' },
    matchTeamsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    teamInfo: { alignItems: 'center', gap: 12, width: 80 },
    teamLogoBg: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#2a2a30', alignItems: 'center', justifyContent: 'center', padding: 12 },
    teamLogo: { width: '100%', height: '100%', resizeMode: 'contain' },
    teamName: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center' },
    vsContainer: { alignItems: 'center' },
    vsText: { color: 'rgba(255,255,255,0.3)', fontSize: 20, fontWeight: '900', fontStyle: 'italic' },
    venueName: { fontSize: 9, fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginTop: 4 },
    matchQuote: { textAlign: 'center', fontSize: 12, fontStyle: 'italic', color: 'rgba(255,255,255,0.4)', lineHeight: 18, marginBottom: 24, paddingHorizontal: 10 },
    findVenueButton: { width: '100%', paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
    findVenueText: { color: 'white', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
    barsSection: { marginTop: 40 },
    filterButton: { paddingBottom: 4 },
    filterText: { fontSize: 12, fontWeight: 'bold' },
    barsCarousel: { paddingHorizontal: 20, gap: 16, paddingBottom: 20 },
    barCard: { width: 300, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    barImageContainer: { height: 176, width: '100%', position: 'relative' },
    barImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    ratingBadge: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    barInfo: { padding: 20 },
    barHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    barName: { fontSize: 18, fontWeight: 'bold', flex: 1 },
    barDistance: { fontSize: 10, fontWeight: 'bold', color: 'rgba(255,255,255,0.4)' },
    barDesc: { fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 16, marginBottom: 16 },
    tagRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
    tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    tagText: { fontSize: 9, fontWeight: 'bold', color: 'white' },
    reserveButton: { width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    reserveButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
    emptyMatches: { alignItems: 'center', padding: 40 },
});

export default CompetitionDetailsScreen;
