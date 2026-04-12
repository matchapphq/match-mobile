import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useStore } from '../store/useStore';
import { apiService } from '../services/api';

const { width } = Dimensions.get("window");

type FavoriteTab = 'all' | 'venues' | 'teams' | 'leagues' | 'restaurants';

const FavouritesScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { colors, computedTheme: themeMode, toggleFavourite, toggleTeamFollow, discoveryHome } = useStore();
    const isLightTheme = themeMode === "light";

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<FavoriteTab>('all');

    const [favoriteVenues, setFavoriteVenues] = useState<any[]>([]);
    const [followedLeagues, setFollowedLeagues] = useState<any[]>([]);

    const followedTeams = discoveryHome.followed_teams;

    const fetchData = async () => {
        try {
            const [venues, leagues] = await Promise.all([
                apiService.getFavoriteVenues(),
                apiService.getFollowedLeagues(),
            ]);
            setFavoriteVenues(venues);
            setFollowedLeagues(leagues);
        } catch (error) {
            console.warn('Failed to load favourites', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchData();
    }, []);

    const handleToggleVenueFavorite = async (venueId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await toggleFavourite(venueId);
        setFavoriteVenues(prev => prev.filter(v => (v.venue_id || v.id) !== venueId));
    };

    const handleToggleTeamFollow = async (team: any) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await toggleTeamFollow(team);
    };

    const handleToggleLeagueFollow = async (leagueId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        try {
            await apiService.toggleLeagueFollow(leagueId);
            setFollowedLeagues(prev => prev.filter(l => l.id !== leagueId));
        } catch (error) {
            console.error("Error toggling league follow:", error);
        }
    };

    const renderTabs = () => {
        const tabs: { key: FavoriteTab; label: string }[] = [
            { key: 'all', label: 'Tout' },
            { key: 'venues', label: 'Lieux' },
            { key: 'teams', label: 'Équipes' },
            { key: 'leagues', label: 'Ligues' },
            { key: 'restaurants', label: 'Restaurants' },
        ];

        return (
            <View style={[styles.tabBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarContent}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.tabItem]}
                            onPress={() => setActiveTab(tab.key)}
                        >
                            <Text style={[
                                styles.tabText,
                                { color: activeTab === tab.key ? colors.primary : colors.textMuted }
                            ]}>
                                {tab.label}
                            </Text>
                            {activeTab === tab.key && (
                                <View style={[styles.tabUnderline, { backgroundColor: colors.primary }]} />
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const renderVenues = () => {
        if (activeTab !== 'all' && activeTab !== 'venues' && activeTab !== 'restaurants') return null;
        
        let filteredVenues = favoriteVenues;
        if (activeTab === 'restaurants') {
            filteredVenues = favoriteVenues.filter(v => (v.venue?.type || v.type)?.toLowerCase().includes('restaurant'));
        } else if (activeTab === 'venues') {
            filteredVenues = favoriteVenues.filter(v => !(v.venue?.type || v.type)?.toLowerCase().includes('restaurant'));
        }

        if (filteredVenues.length === 0) return null;

        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Top lieux & restos</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Map')}>
                        <Text style={[styles.seeAllText, { color: colors.primary }]}>Voir tout</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                    {filteredVenues.map((fav) => {
                        const venue = fav.venue || fav;
                        return (
                            <TouchableOpacity 
                                key={venue.id} 
                                style={[styles.venueCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={() => navigation.navigate('VenueProfile', { venueId: venue.id })}
                            >
                                <View style={styles.venueImageContainer}>
                                    <Image 
                                        source={{ uri: venue.cover_image_url || "https://images.unsplash.com/photo-1514933651103-005eec06c04b" }} 
                                        style={styles.venueImage} 
                                    />
                                    <TouchableOpacity 
                                        style={[styles.favButton, { backgroundColor: isLightTheme ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.4)' }]}
                                        onPress={() => handleToggleVenueFavorite(venue.id)}
                                    >
                                        <MaterialIcons name="favorite" size={20} color={colors.primary} />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.venueInfo}>
                                    <View style={styles.venueTitleRow}>
                                        <Text style={[styles.venueName, { color: colors.text }]} numberOfLines={1}>{venue.name}</Text>
                                        <View style={styles.ratingRow}>
                                            <MaterialIcons name="star" size={14} color={colors.emerald500} />
                                            <Text style={[styles.ratingText, { color: colors.emerald500 }]}>{parseFloat(venue.average_rating || "0").toFixed(1)}</Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.venueSub, { color: colors.textMuted }]}>{venue.city} • {venue.type}</Text>
                                    <TouchableOpacity style={[styles.reserveButton, { backgroundColor: colors.primary }]}>
                                        <Text style={[styles.reserveButtonText, { color: 'white' }]}>Réserver</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        );
    };

    const renderTeams = () => {
        if (activeTab !== 'all' && activeTab !== 'teams') return null;
        if (followedTeams.length === 0) return null;

        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Équipes suivies</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('TeamsConfiguration')}>
                        <Text style={[styles.seeAllText, { color: colors.primary }]}>Gérer</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.teamsList}>
                    {followedTeams.map((team) => (
                        <TouchableOpacity 
                            key={team.id || team.team_id} 
                            style={[styles.teamItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={() => navigation.navigate('TeamDetail', { teamId: team.id })}
                        >
                            <View style={[styles.teamLogoContainer, { backgroundColor: "#fff" }]}>
                                {team.logo_url ? (
                                    <Image source={{ uri: team.logo_url }} style={styles.teamLogo} />
                                ) : (
                                    <MaterialCommunityIcons name="soccer" size={24} color={colors.textMuted} />
                                )}
                            </View>
                            <View style={styles.teamInfo}>
                                <Text style={[styles.teamName, { color: colors.text }]}>{team.name}</Text>
                                <Text style={[styles.teamLeague, { color: colors.textMuted }]}>{team.league?.name || team.league || "Football"}</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleToggleTeamFollow(team)}>
                                <MaterialIcons name="favorite" size={24} color={colors.primary} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    const renderLeagues = () => {
        if (activeTab !== 'all' && activeTab !== 'leagues') return null;
        if (followedLeagues.length === 0) return null;

        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Ligues & Compétitions</Text>
                </View>
                <View style={styles.leaguesGrid}>
                    {followedLeagues.map((league) => (
                        <TouchableOpacity 
                            key={league.id} 
                            style={[styles.leagueCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={() => navigation.navigate('CompetitionDetails', { competitionId: league.id, competitionName: league.name })}
                        >
                            <View style={[styles.leagueLogoContainer, { backgroundColor: colors.surfaceAlt }]}>
                                {league.logo_url ? (
                                    <Image source={{ uri: league.logo_url }} style={styles.leagueLogo} />
                                ) : (
                                    <MaterialIcons name="emoji-events" size={32} color={colors.primary} />
                                )}
                            </View>
                            <Text style={[styles.leagueNameText, { color: colors.text }]} numberOfLines={1}>{league.name}</Text>
                            <TouchableOpacity 
                                style={[styles.detailsButton, { backgroundColor: colors.accent10, borderColor: colors.accent20 }]}
                                onPress={() => navigation.navigate('CompetitionDetails', { competitionId: league.id, competitionName: league.name })}
                            >
                                <Text style={[styles.detailsButtonText, { color: colors.primary }]}>Détails</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    const isEmpty = favoriteVenues.length === 0 && followedTeams.length === 0 && followedLeagues.length === 0;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isLightTheme ? "dark-content" : "light-content"} translucent backgroundColor="transparent" />
            
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surface }]} onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Mes Favoris</Text>
            </View>

            {renderTabs()}

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : isEmpty ? (
                <View style={styles.emptyContainer}>
                    <MaterialIcons name="favorite-border" size={64} color={colors.textMuted} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucun favori</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                        Ajoute des lieux, des équipes ou des ligues à tes favoris pour les retrouver ici.
                    </Text>
                    <TouchableOpacity 
                        style={[styles.emptyCTA, { backgroundColor: colors.primary }]}
                        onPress={() => navigation.navigate('Tab', { screen: 'Discover' })}
                    >
                        <Text style={styles.emptyCTAText}>Découvrir</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                >
                    {renderVenues()}
                    {renderTeams()}
                    {renderLeagues()}
                    <View style={{ height: 100 }} />
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 15, paddingHorizontal: 20, paddingBottom: 15 },
    backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', letterSpacing: -0.5 },
    tabBar: { borderBottomWidth: 1 },
    tabBarContent: { paddingHorizontal: 20, gap: 25, paddingVertical: 10 },
    tabItem: { paddingVertical: 8, position: 'relative' },
    tabText: { fontSize: 15, fontWeight: '600' },
    tabUnderline: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, borderRadius: 2 },
    scrollContent: { paddingVertical: 20 },
    section: { marginBottom: 35 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold' },
    seeAllText: { fontSize: 14, fontWeight: '600' },
    horizontalScroll: { paddingHorizontal: 20, gap: 15 },
    venueCard: { width: 280, borderRadius: 20, overflow: 'hidden', borderWidth: 1 },
    venueImageContainer: { height: 160, width: '100%', position: 'relative' },
    venueImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    favButton: { position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    venueInfo: { padding: 15 },
    venueTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    venueName: { fontSize: 16, fontWeight: 'bold', flex: 1 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { fontSize: 14, fontWeight: 'bold' },
    venueSub: { fontSize: 12, marginBottom: 15 },
    reserveButton: { width: '100%', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
    reserveButtonText: { fontSize: 14, fontWeight: 'bold' },
    teamsList: { paddingHorizontal: 20, gap: 12 },
    teamItem: { flexDirection: 'row', alignItems: 'center', gap: 15, padding: 12, borderRadius: 16, borderWidth: 1 },
    teamLogoContainer: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', padding: 10 },
    teamLogo: { width: '100%', height: '100%', resizeMode: 'contain' },
    teamInfo: { flex: 1 },
    teamName: { fontSize: 15, fontWeight: 'bold' },
    teamLeague: { fontSize: 12 },
    leaguesGrid: { paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    leagueCard: { width: (width - 52) / 2, padding: 15, borderRadius: 20, alignItems: 'center', gap: 10, borderWidth: 1 },
    leagueLogoContainer: { width: 64, height: 64, borderRadius: 12, alignItems: 'center', justifyContent: 'center', padding: 12 },
    leagueLogo: { width: '100%', height: '100%', resizeMode: 'contain' },
    leagueNameText: { fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
    detailsButton: { width: '100%', paddingVertical: 8, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
    detailsButtonText: { fontSize: 12, fontWeight: 'bold' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 15 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold' },
    emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
    emptyCTA: { paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12, marginTop: 10 },
    emptyCTAText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default FavouritesScreen;
