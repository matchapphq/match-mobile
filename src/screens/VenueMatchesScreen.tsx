import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ImageBackground,
    StatusBar,
    ActivityIndicator,
    Dimensions,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { mobileApi, Venue, VenueMatch } from '../services/mobileApi';
import { useStore } from '../store/useStore';

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
    const venueAddress: string | undefined = route?.params?.venueAddress;
    const venueImage: string | undefined = route?.params?.venueImage;
    
    const [venue, setVenue] = useState<Venue | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<SportFilter>('all');

    const sportFilters: { key: SportFilter; label: string }[] = [
        { key: 'all', label: 'Tout voir' },
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
            setError("Impossible de charger les matchs de ce bar.");
        } finally {
            setIsLoading(false);
        }
    }, [venueId]);

    useEffect(() => {
        loadVenue();
    }, [loadVenue]);

    const handleBack = () => {
        navigation.goBack();
    };

    const filteredMatches = useMemo(() => {
        if (!venue?.matches) return [];
        if (activeFilter === 'all') return venue.matches;
        return venue.matches.filter(match => {
            const league = match.league.toLowerCase();
            if (activeFilter === 'football') {
                return league.includes('ligue') || league.includes('premier') || 
                       league.includes('liga') || league.includes('champions') ||
                       league.includes('bundesliga') || league.includes('serie');
            }
            if (activeFilter === 'rugby') {
                return league.includes('rugby') || league.includes('top 14');
            }
            if (activeFilter === 'basket') {
                return league.includes('nba') || league.includes('basket') || league.includes('euroleague');
            }
            return true;
        });
    }, [venue?.matches, activeFilter]);

    const groupedMatches = useMemo((): GroupedMatches[] => {
        if (!filteredMatches.length) return [];
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const groups: { [key: string]: VenueMatch[] } = {};
        
        filteredMatches.forEach(match => {
            const matchDate = new Date();
            matchDate.setDate(parseInt(match.date));
            matchDate.setHours(0, 0, 0, 0);
            
            let label: string;
            if (matchDate.getTime() === today.getTime()) {
                label = "Aujourd'hui";
            } else if (matchDate.getTime() === tomorrow.getTime()) {
                label = "Demain";
            } else {
                const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
                label = `${days[matchDate.getDay()]} ${match.date} ${match.month}`;
            }
            
            if (!groups[label]) {
                groups[label] = [];
            }
            groups[label].push(match);
        });
        
        return Object.entries(groups).map(([label, matches]) => ({ label, matches }));
    }, [filteredMatches]);

    const isLive = (match: VenueMatch) => {
        const now = new Date();
        const [hours] = match.time.split(':').map(Number);
        return now.getHours() >= hours && now.getHours() < hours + 2;
    };

    const isSoon = (match: VenueMatch) => {
        const now = new Date();
        const [hours] = match.time.split(':').map(Number);
        return hours - now.getHours() <= 1 && hours - now.getHours() > 0;
    };

    const renderMatchCard = (match: VenueMatch, isFirst: boolean = false) => {
        const live = isLive(match);
        const soon = isSoon(match);
        
        return (
            <TouchableOpacity
                key={match.id}
                style={[
                    styles.matchCard,
                    { 
                        backgroundColor: themeMode === 'light' ? '#fff' : '#1c1c21',
                        borderColor: live ? 'rgba(255,107,0,0.3)' : colors.border,
                    }
                ]}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('MatchDetail', { matchId: match.id })}
            >
                {live && (
                    <View style={styles.liveGlow} />
                )}
                
                <View style={styles.matchCardContent}>
                    {/* Time Column */}
                    <View style={styles.timeColumn}>
                        <Text style={[styles.matchTime, { color: colors.text }]}>{match.time}</Text>
                        {live ? (
                            <View style={styles.liveBadge}>
                                <Text style={styles.liveBadgeText}>En direct</Text>
                            </View>
                        ) : soon ? (
                            <View style={[styles.soonBadge, { backgroundColor: colors.surfaceAlt }]}>
                                <Text style={[styles.soonBadgeText, { color: colors.textMuted }]}>Bientôt</Text>
                            </View>
                        ) : null}
                    </View>
                    
                    {/* Divider */}
                    <View style={[styles.verticalDivider, { backgroundColor: colors.divider }]} />
                    
                    {/* Match Info */}
                    <View style={styles.matchInfo}>
                        <View style={styles.leagueRow}>
                            <Text style={[styles.leagueText, { color: colors.textMuted }]}>
                                {match.league.toUpperCase()}
                            </Text>
                            {live && (
                                <MaterialIcons name="tv" size={14} color={colors.textMuted} />
                            )}
                        </View>
                        
                        <View style={styles.teamsRow}>
                            <View style={styles.teamBadges}>
                                <View style={[styles.teamBadge, { backgroundColor: colors.surfaceAlt, borderColor: colors.surface }]}>
                                    <Text style={[styles.teamBadgeText, { color: colors.text }]}>{match.team1.charAt(0)}</Text>
                                </View>
                                <View style={[styles.teamBadge, styles.teamBadgeOverlap, { backgroundColor: colors.surfaceAlt, borderColor: colors.surface }]}>
                                    <Text style={[styles.teamBadgeText, { color: colors.text }]}>{match.team2.charAt(0)}</Text>
                                </View>
                            </View>
                            <Text style={[styles.teamsText, { color: colors.text }]}>
                                {match.team1} <Text style={{ color: colors.textMuted, fontWeight: 'normal' }}>vs</Text> {match.team2}
                            </Text>
                        </View>
                    </View>
                    
                    {/* Chevron */}
                    <MaterialIcons 
                        name={live ? "chevron-right" : "notifications-none"} 
                        size={24} 
                        color={colors.textMuted} 
                    />
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centerState, { backgroundColor: colors.background }]}>
                <ActivityIndicator color={colors.primary} />
                <Text style={[styles.stateText, { color: colors.textSecondary }]}>Chargement des matchs...</Text>
            </View>
        );
    }

    if (error || !venue) {
        return (
            <View style={[styles.container, styles.centerState, { backgroundColor: colors.background }]}>
                <Text style={[styles.stateText, { color: colors.textSecondary }]}>{error ?? "Impossible de charger les matchs."}</Text>
                <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={loadVenue} activeOpacity={0.85}>
                    <MaterialIcons name="refresh" size={18} color={colors.white} />
                    <Text style={[styles.retryButtonText, { color: colors.white }]}>Réessayer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.retryButton, { marginTop: 12, backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary }]}
                    onPress={handleBack}
                    activeOpacity={0.85}
                >
                    <MaterialIcons name="arrow-back" size={18} color={colors.primary} />
                    <Text style={[styles.retryButtonText, { color: colors.primary }]}>Retour</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const matchCount = venue.matches?.length ?? 0;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Header Image Section */}
                <View style={styles.imageContainer}>
                    <ImageBackground
                        source={{ uri: venueImage || venue.image }}
                        style={styles.headerImage}
                    >
                        <LinearGradient
                            colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(11,11,15,0.4)', '#0b0b0f']}
                            locations={[0, 0.3, 0.6, 1]}
                            style={styles.imageGradient}
                        />
                        
                        {/* Top Header Buttons */}
                        <View style={[styles.headerButtons, { paddingTop: insets.top + 12 }]}>
                            <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
                                {Platform.OS === 'ios' ? (
                                    <BlurView intensity={30} tint="dark" style={styles.headerButtonBlur}>
                                        <MaterialIcons name="arrow-back" size={22} color={COLORS.white} />
                                    </BlurView>
                                ) : (
                                    <View style={[styles.headerButtonBlur, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                                        <MaterialIcons name="arrow-back" size={22} color={COLORS.white} />
                                    </View>
                                )}
                            </TouchableOpacity>
                            <View style={styles.headerButtonsRight}>
                                <TouchableOpacity style={styles.headerButton}>
                                    {Platform.OS === 'ios' ? (
                                        <BlurView intensity={30} tint="dark" style={styles.headerButtonBlur}>
                                            <MaterialIcons name="notifications-none" size={22} color={COLORS.white} />
                                        </BlurView>
                                    ) : (
                                        <View style={[styles.headerButtonBlur, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                                            <MaterialIcons name="notifications-none" size={22} color={COLORS.white} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.headerButton}>
                                    {Platform.OS === 'ios' ? (
                                        <BlurView intensity={30} tint="dark" style={styles.headerButtonBlur}>
                                            <MaterialIcons name="share" size={22} color={COLORS.white} />
                                        </BlurView>
                                    ) : (
                                        <View style={[styles.headerButtonBlur, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                                            <MaterialIcons name="share" size={22} color={COLORS.white} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        {/* Venue Info */}
                        <View style={styles.venueInfoContainer}>
                            <View style={styles.badgesRow}>
                                <View style={styles.liveSportsBadge}>
                                    <Text style={styles.liveSportsBadgeText}>Live Sports</Text>
                                </View>
                                <View style={styles.matchCountBadge}>
                                    <View style={styles.greenDot} />
                                    <Text style={styles.matchCountText}>{matchCount} Matchs</Text>
                                </View>
                            </View>
                            <Text style={styles.venueTitle}>{venueName || venue.name}</Text>
                            <View style={styles.addressRow}>
                                <MaterialIcons name="location-on" size={18} color={colors.primary} />
                                <Text style={styles.addressText}>{venueAddress || venue.address}</Text>
                            </View>
                        </View>
                    </ImageBackground>
                </View>
                
                {/* Content */}
                <View style={styles.contentContainer}>
                    {/* Sport Filters */}
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filtersContainer}
                        style={styles.filtersScroll}
                    >
                        {sportFilters.map((filter) => (
                            <TouchableOpacity
                                key={filter.key}
                                style={[
                                    styles.filterPill,
                                    activeFilter === filter.key 
                                        ? { backgroundColor: colors.primary }
                                        : { backgroundColor: themeMode === 'light' ? '#f1f5f9' : '#1c1c21', borderColor: colors.border }
                                ]}
                                onPress={() => setActiveFilter(filter.key)}
                                activeOpacity={0.8}
                            >
                                <Text style={[
                                    styles.filterPillText,
                                    { color: activeFilter === filter.key ? '#fff' : colors.textMuted }
                                ]}>
                                    {filter.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    
                    {/* Match Groups */}
                    <View style={styles.matchesContainer}>
                        {groupedMatches.length > 0 ? (
                            groupedMatches.map((group, groupIndex) => (
                                <View key={group.label} style={styles.matchGroup}>
                                    {/* Date Divider */}
                                    <View style={styles.dateDivider}>
                                        <View style={[styles.dateLine, { backgroundColor: colors.divider }]} />
                                        <Text style={[
                                            styles.dateLabel,
                                            { color: group.label === "Aujourd'hui" ? colors.text : colors.textMuted }
                                        ]}>
                                            {group.label.toUpperCase()}
                                        </Text>
                                        <View style={[styles.dateLine, { backgroundColor: colors.divider }]} />
                                    </View>
                                    
                                    {/* Match Cards */}
                                    <View style={styles.matchCards}>
                                        {group.matches.map((match, index) => renderMatchCard(match, index === 0))}
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <MaterialIcons name="sports-soccer" size={48} color={colors.textMuted} />
                                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                                    Aucun match trouvé pour ce filtre
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 16,
    },
    stateText: {
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
    },
    scrollView: {
        flex: 1,
    },
    imageContainer: {
        width: '100%',
        height: 320,
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    imageGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    headerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 30,
    },
    headerButtonsRight: {
        flexDirection: 'row',
        gap: 12,
    },
    headerButton: {
        width: 44,
        height: 44,
    },
    headerButtonBlur: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    venueInfoContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingBottom: 24,
        zIndex: 20,
    },
    badgesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    liveSportsBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    liveSportsBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    matchCountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    greenDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#22c55e',
    },
    matchCountText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    venueTitle: {
        fontSize: 36,
        fontWeight: '900',
        color: COLORS.white,
        textTransform: 'uppercase',
        letterSpacing: -1,
        marginBottom: 4,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    addressText: {
        color: '#e5e7eb',
        fontSize: 15,
        fontWeight: '500',
    },
    contentContainer: {
        marginTop: -8,
    },
    filtersScroll: {
        marginBottom: 24,
    },
    filtersContainer: {
        paddingHorizontal: 24,
        gap: 12,
    },
    filterPill: {
        height: 36,
        paddingHorizontal: 16,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    filterPillText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    matchesContainer: {
        paddingHorizontal: 24,
        gap: 32,
    },
    matchGroup: {
        gap: 16,
    },
    dateDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dateLine: {
        flex: 1,
        height: 1,
    },
    dateLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.5,
    },
    matchCards: {
        gap: 12,
    },
    matchCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        overflow: 'hidden',
    },
    liveGlow: {
        position: 'absolute',
        top: -16,
        right: -16,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,107,0,0.1)',
    },
    matchCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    timeColumn: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 56,
        gap: 4,
    },
    matchTime: {
        fontSize: 20,
        fontWeight: '900',
    },
    liveBadge: {
        backgroundColor: 'rgba(255,107,0,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    liveBadgeText: {
        color: COLORS.primary,
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    soonBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    soonBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    verticalDivider: {
        width: 1,
        height: 40,
    },
    matchInfo: {
        flex: 1,
        gap: 8,
    },
    leagueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leagueText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
    },
    teamsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    teamBadges: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    teamBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    teamBadgeOverlap: {
        marginLeft: -8,
    },
    teamBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    teamsText: {
        fontSize: 14,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        gap: 16,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 999,
    },
    retryButtonText: {
        fontWeight: '700',
        fontSize: 13,
    },
});

export default VenueMatchesScreen;
