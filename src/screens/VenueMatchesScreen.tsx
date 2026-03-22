import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Dimensions,
    Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mobileApi, Venue, VenueMatch } from '../services/mobileApi';
import { useStore } from '../store/useStore';
import { MatchListItemSkeleton } from '../components/Skeleton';
import { sharing } from '../utils/sharing';

const { width } = Dimensions.get('window');

type SportFilter = 'all' | 'football' | 'rugby' | 'basket';

interface GroupedMatches {
    label: string;
    matches: VenueMatch[];
}

const VenueMatchesScreen = ({ navigation, route }: { navigation: any; route: any }) => {
    const { colors, computedTheme: themeMode } = useStore();
    const insets = useSafeAreaInsets();
    const venueId: string | undefined = route?.params?.venueId;
    const venueName: string | undefined = route?.params?.venueName;
    
    const [venue, setVenue] = useState<Venue | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<SportFilter>('all');

    const sportFilters: { key: SportFilter; label: string }[] = [
        { key: 'all', label: 'Tout' },
        { key: 'football', label: 'Football' },
        { key: 'rugby', label: 'Rugby' },
        { key: 'basket', label: 'Basket' },
    ];

    const loadVenue = useCallback(async () => {
        try {
            setError(null);
            setIsLoading(true);
            const data = venueId ? await mobileApi.fetchVenueById(venueId) : null;
            setVenue(data ?? null);
        } catch (err) {
            console.warn('Failed to load venue matches', err);
            setError("Impossible de charger les matchs.");
        } finally {
            setIsLoading(false);
        }
    }, [venueId]);

    useEffect(() => {
        loadVenue();
    }, [loadVenue]);

    const handleBack = () => navigation.goBack();

    const filteredMatches = useMemo(() => {
        if (!venue?.matches) return [];
        if (activeFilter === 'all') return venue.matches;
        return venue.matches.filter(match => {
            const league = match.league.toLowerCase();
            if (activeFilter === 'football') return league.includes('ligue') || league.includes('premier') || league.includes('liga') || league.includes('champions');
            if (activeFilter === 'rugby') return league.includes('rugby') || league.includes('top 14');
            if (activeFilter === 'basket') return league.includes('nba') || league.includes('basket');
            return true;
        });
    }, [venue?.matches, activeFilter]);

    const groupedMatches = useMemo((): GroupedMatches[] => {
        if (!filteredMatches.length) return [];
        const groups: { [key: string]: VenueMatch[] } = {};
        filteredMatches.forEach(match => {
            const label = `${match.month} ${match.date}`;
            if (!groups[label]) groups[label] = [];
            groups[label].push(match);
        });
        return Object.entries(groups).map(([label, matches]) => ({ label, matches }));
    }, [filteredMatches]);

    if (isLoading) return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <ActivityIndicator size="large" color={colors.accent} />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? "light-content" : "dark-content"} />
            
            {/* 2026 Compact Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: colors.border }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
                        <MaterialIcons name="chevron-left" size={32} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{venueName || venue?.name}</Text>
                    <TouchableOpacity style={styles.iconBtn}>
                        <MaterialIcons name="favorite-border" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
                <View style={styles.headerMeta}>
                    <MaterialIcons name="location-on" size={14} color={colors.textSecondary} />
                    <Text style={[styles.headerAddress, { color: colors.textSecondary }]} numberOfLines={1}>{venue?.address}</Text>
                    <View style={[styles.statusPill, { backgroundColor: `${colors.accent}20` }]}>
                        <Text style={[styles.statusText, { color: colors.accent }]}>OUVERT</Text>
                    </View>
                </View>
            </View>

            {/* Sport Filters Bar */}
            <View style={styles.filtersWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
                    {sportFilters.map(f => (
                        <TouchableOpacity 
                            key={f.key} 
                            onPress={() => setActiveFilter(f.key)}
                            style={[
                                styles.filterPill, 
                                activeFilter === f.key ? { backgroundColor: colors.accent } : { borderColor: colors.border, borderWidth: 1 }
                            ]}
                        >
                            <Text style={[styles.filterLabel, { color: activeFilter === f.key ? '#000' : colors.textSecondary }]}>
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Agenda Timeline List */}
            <ScrollView contentContainerStyle={styles.listContent}>
                {groupedMatches.length > 0 ? (
                    groupedMatches.map(group => (
                        <View key={group.label} style={styles.dateGroup}>
                            <Text style={[styles.dateHeading, { color: colors.textSecondary }]}>{group.label}</Text>
                            {group.matches.map(match => (
                                <TouchableOpacity 
                                    key={match.id} 
                                    style={[styles.matchCard, { backgroundColor: colors.surface }]}
                                    onPress={() => navigation.navigate('MatchDetail', { matchId: match.id })}
                                >
                                    <View style={styles.cardHeader}>
                                        <Image source={{ uri: match.team1Logo }} style={styles.leagueIcon} contentFit="contain" />
                                        <Text style={[styles.leagueName, { color: colors.textSecondary }]}>{match.league}</Text>
                                    </View>
                                    <Text style={[styles.teamsText, { color: colors.text }]}>
                                        {match.team1} <Text style={{ fontWeight: '400', opacity: 0.6 }}>vs</Text> {match.team2}
                                    </Text>
                                    <View style={styles.cardFooter}>
                                        <View style={[styles.timePill, { backgroundColor: colors.background }]}>
                                            <Text style={[styles.timeText, { color: colors.text }]}>{match.time}</Text>
                                        </View>
                                        <View style={styles.screenInfo}>
                                            <MaterialCommunityIcons name="television" size={14} color={colors.textSecondary} />
                                            <Text style={[styles.screenText, { color: colors.textSecondary }]}>Sur 4 écrans</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="filter-variant-remove" size={64} color={colors.surface} />
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucun match trouvé</Text>
                        <TouchableOpacity onPress={() => setActiveFilter('all')} style={styles.resetBtn}>
                            <Text style={[styles.resetText, { color: colors.accent }]}>Réinitialiser les filtres</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 44 },
    iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', textAlign: 'center' },
    headerMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 },
    headerAddress: { fontSize: 12, fontWeight: '500', maxWidth: '60%' },
    statusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: '900' },
    
    filtersWrapper: { paddingVertical: 16 },
    filtersContainer: { paddingHorizontal: 20, gap: 10 },
    filterPill: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
    filterLabel: { fontSize: 13, fontWeight: '700' },
    
    listContent: { paddingHorizontal: 20, paddingBottom: 40 },
    dateGroup: { marginBottom: 32 },
    dateHeading: { fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 },
    matchCard: { borderRadius: 24, padding: 16, marginBottom: 12 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    leagueIcon: { width: 16, height: 16 },
    leagueName: { fontSize: 11, fontWeight: '600' },
    teamsText: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    timePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    timeText: { fontSize: 12, fontWeight: '800' },
    screenInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    screenText: { fontSize: 12, fontWeight: '600' },
    
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: 16 },
    emptyTitle: { fontSize: 16, fontWeight: '700' },
    resetBtn: { marginTop: 8 },
    resetText: { fontSize: 14, fontWeight: '700' },
});

export default VenueMatchesScreen;
